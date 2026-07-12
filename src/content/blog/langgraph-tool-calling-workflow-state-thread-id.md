---
title: "从 Dialogue_System.py 看懂 LangGraph 与 Tool Calling"
description: "从一段 LangGraph 搜索代码出发，拆解固定工作流、@tool、bind_tools、ToolNode、Pydantic、State 与 thread_id 的完整调用链。"
date: 2026-07-12T15:10:51+07:00
tags:
  - "LangGraph"
  - "Tool Calling"
---

第一次看到 `@tool` 时，很容易产生一种错觉：给函数加上装饰器，模型就突然获得了调用 Python 的能力。继续往下看 LangGraph，问题反而更多了：Tavily 到底算不算 Tool？为什么要定义节点和边？模型调用明明是无状态的，`thread_id` 又保存了什么？工具参数如何从 JSON 变成真正的函数参数？

我最后发现，这些问题都指向同一件事：**模型从不直接执行工具。模型只负责表达“我想调用哪个工具、参数是什么”，应用框架负责完成真实的函数调用。**

这篇文章从项目里的 `Dialogue_System.py` 出发，把固定工作流、Tool Calling、消息、状态和参数验证连成一条完整链路。

## 先看 `Dialogue_System.py` 做了什么

这份代码实现了一个联网搜索助手。用户输入问题后，程序依次完成三件事：

```text
START → understand → search → answer → END
```

- `understand`：让 LLM 理解问题并生成搜索关键词。
- `search`：调用 Tavily 搜索互联网。
- `answer`：让 LLM 根据搜索结果组织回答。

代码可以按六层理解：

| 层次       | 代码中的内容                                                          | 职责                   |
| ---------- | --------------------------------------------------------------------- | ---------------------- |
| 配置层     | `.env`、模型名称、API Key                                             | 准备运行参数           |
| 资源层     | `ChatOpenAI`、`TavilyClient`                                          | 创建模型和搜索客户端   |
| 状态层     | `SearchState`                                                         | 保存节点之间共享的数据 |
| 业务节点层 | `understand_query_node`、`tavily_search_node`、`generate_answer_node` | 完成每一步实际工作     |
| 编排层     | `StateGraph`、节点、边、`InMemorySaver`                               | 决定执行顺序并保存状态 |
| 入口层     | `main()`、`astream()`                                                 | 接收输入并运行工作流   |

项目锁定的是 `langgraph==1.0.0a3` 和 `langchain_openai==0.3.33`。下面重点讨论稳定的调用原理；具体 API 仍应以当前官方文档和项目锁定版本为准。

它使用了 LangGraph，但准确地说，这是一个**固定工作流**，还不是由模型自主选择工具的 Agent。

## Tavily 是 Tool 吗

这个问题需要分两层回答。

从能力上说，Tavily 是程序可以使用的外部搜索工具。但在当前代码里，它不是注册给模型的 LangChain Tool，只是 `search` 节点内部直接调用的普通 SDK：

```python
response = tavily_client.search(
    query=search_query,
    search_depth="basic",
    max_results=5,
)
```

调用 Tavily 的决定由程序提前写死。只要运行到 `search` 节点，它就一定会搜索；模型既不能跳过搜索，也不能改用另一个工具。

如果要让它成为模型可选择的 Tool，需要先包装函数：

```python
from langchain_core.tools import tool


@tool
def search_web(query: str, limit: int = 5) -> dict:
    """搜索互联网中的最新资料。"""
    return tavily_client.search(
        query=query,
        max_results=limit,
    )
```

然后把它绑定到模型：

```python
model_with_tools = llm.bind_tools([search_web])
```

两种实现的区别很直接：

```text
当前程序：代码决定一定调用 Tavily

Tool Calling Agent：模型决定是否调用、调用哪个 Tool、生成什么参数
```

固定工作流并不比 Agent 低级。如果产品规则就是“任何问题都必须先搜索再回答”，当前设计反而更确定，也更容易测试。只有当搜索是可选的、工具有多个、调用顺序不固定，或者模型需要根据结果再次搜索时，Tool Calling 才真正有价值。

## LangGraph 是什么

一句话解释：**LangGraph 是一个用状态、节点和边编排长期运行、有状态 AI 工作流的底层运行时。**

官方文档把核心概念归纳为 State、Node 和 Edge。刚上手时，再补上编译和持久化，已经足够理解大部分代码：

1. `State`：当前任务共享的数据快照。
2. `Node`：读取 State、完成一个步骤、返回部分状态更新。
3. `Edge`：决定接下来运行哪个 Node，可以固定，也可以条件分支。
4. `compile()`：检查图结构，并挂载 checkpointer、中断点等运行能力。
5. Checkpointer 与 `thread_id`：保存和恢复某一条任务线程。

节点和边看起来比顺序调用函数麻烦，但它们把流程显式化了。重试、并行、条件路由、人工审批、中断恢复和循环上限，都需要一个明确的执行边界。

```text
模型负责：理解、判断、生成参数、总结

Graph 负责：执行顺序、路由、状态、错误处理、持久化和权限边界
```

Agent 也不是一个完全自由的黑盒。常见的工具调用图仍有固定结构，只是其中一条边由模型输出决定：

```text
                       ┌──────────────┐
                       │              │
START → model → 有 tool_calls？       │
                │              │      │
                │否            │是    │
                ↓              ↓      │
               END         ToolNode ──┘
```

外层 workflow 是开发者写定的；模型只在允许的范围内决定下一步。简单、标准的 Agent 可以优先使用 LangChain 的高层 `create_agent`。需要自定义状态、复杂路由、人工审批或恢复能力时，再直接使用 LangGraph 的 `StateGraph`。

## `@tool` 到底做了什么

先看一个普通函数：

```python
def get_weather(city: str, days: int = 1) -> dict:
    """查询指定城市未来几天的天气。"""
    ...
```

加上 `@tool` 后，LangChain 会把它包装成 `StructuredTool`。包装对象保存的核心信息包括：

```text
name          get_weather
description   查询指定城市未来几天的天气
parameters    city、days
types         string、integer
required      city
default       days=1
func          原始 Python 函数
```

这些信息可以生成接近下面的 JSON Schema：

```json
{
  "name": "get_weather",
  "description": "查询指定城市未来几天的天气。",
  "parameters": {
    "type": "object",
    "properties": {
      "city": { "type": "string" },
      "days": { "type": "integer", "default": 1 }
    },
    "required": ["city"]
  }
}
```

`@tool` 到这里就完成任务了。它不会主动请求模型，也不会执行函数。

`bind_tools()` 负责下一步：把工具的名称、用途和输入 Schema 转换成模型供应商需要的协议，并随请求一起发送给模型。

```python
model_with_tools = llm.bind_tools([get_weather])
```

模型看到的是工具说明，不是 Python 源码。它可以据此生成调用意图，但没有权限直接进入进程执行函数。

可以把三个角色记成一句话：

```text
@tool 定义工具，bind_tools 告诉模型，ToolNode 执行工具。
```

## Tool Calling 的完整链路

以“曼谷天气怎么样”为例，一次完整调用会经历下面这些步骤：

```text
Python 函数 + @tool
        ↓
名称、描述、JSON Schema
        ↓ bind_tools()
模型收到可用工具列表
        ↓
模型返回 tool_call
        ↓
arguments JSON 字符串解析成 dict
        ↓
根据 tool name 找到 StructuredTool
        ↓
tool.invoke(args)，由 Pydantic 验证参数
        ↓
func(**kwargs)
        ↓
得到 Python result
        ↓
序列化并包装成 ToolMessage
        ↓
连同历史消息再次调用模型
        ↓
模型生成答案，或者继续调用工具
```

模型供应商返回的原始消息大致如下：

```json
{
  "role": "assistant",
  "content": null,
  "tool_calls": [
    {
      "id": "call_123",
      "type": "function",
      "function": {
        "name": "get_weather",
        "arguments": "{\"city\":\"Bangkok\",\"days\":3}"
      }
    }
  ]
}
```

注意 `function.arguments`：它是 JSON 字符串。LangChain 适配消息后，通常会把它规范成 Python 数据：

```python
{
    "name": "get_weather",
    "args": {
        "city": "Bangkok",
        "days": 3,
    },
    "id": "call_123",
    "type": "tool_call",
}
```

从这里开始，工作已经回到普通程序世界。框架根据 `name` 查找工具，根据 `id` 追踪这次调用，然后验证 `args` 并执行函数。

## JSON、Pydantic 和 `**kwargs` 各管一层

这三个概念经常被混在一起。最简单的理解方式，是把它们放到三个不同层次。

### 第一层：JSON 负责“能不能读”

```python
import json

args = json.loads(
    '{"city":"Bangkok","days":3,"enabled":true,"result":null}'
)
```

得到：

```python
{
    "city": "Bangkok",
    "days": 3,
    "enabled": True,
    "result": None,
}
```

常见映射如下：

| JSON    | Python  |
| ------- | ------- |
| object  | `dict`  |
| array   | `list`  |
| `true`  | `True`  |
| `false` | `False` |
| `null`  | `None`  |

`json.loads()` 只判断输入是不是合法 JSON。`{"days": 30}` 完全可以被解析，它不知道工具只允许查询七天。

### 第二层：Pydantic 负责“长得对不对”

Pydantic 是一个基于 Python 类型标注的数据验证和序列化库。LangChain 可以根据函数签名自动生成参数模型，也可以由开发者显式定义：

```python
from pydantic import BaseModel, ConfigDict, Field


class WeatherInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    city: str = Field(min_length=1)
    days: int = Field(default=1, ge=1, le=7)
```

然后执行：

```python
validated = WeatherInput.model_validate(
    {"city": "Bangkok", "days": "3"}
)
kwargs = validated.model_dump()
```

默认模式下，Pydantic 会把字符串 `"3"` 转成整数 `3`。如果不希望自动转换，可以启用严格模式。

Pydantic 检查的内容远不止类型：必填字段、多余字段、默认值、数值范围、字符串长度、正则表达式、`Literal`、Enum 和嵌套对象都可以验证。其中能被 JSON Schema 表达的约束会随工具定义发送给模型；自定义字段或跨字段验证器通常只在工具执行时生效，模型未必能从 Schema 中看见这些规则。

不过，它仍然不知道 `FakeCity` 是否真实存在。

### 第三层：工具和外部系统负责“事实上对不对”

下面的数据符合 `WeatherInput` 的结构：

```python
{"city": "FakeCity", "days": 3}
```

`city` 是非空字符串，`days` 也在合法范围内，所以 Pydantic 会让它通过。城市是否存在、用户有没有权限、订单是否有效、账户余额是否足够，这些事实只能由工具业务逻辑、数据库或外部 API 判断。

```text
json.loads：数据能不能读
Pydantic：数据长得对不对
工具/API：数据事实上对不对
```

## 为什么 `func(**kwargs)` 能调用真实函数

这一步没有 LangChain 的魔法，就是 Python 的关键字参数展开。

```python
def weather_func(city: str, days: int = 1) -> dict:
    return {"city": city, "days": days}


kwargs = {
    "days": 3,
    "city": "Bangkok",
}

weather_func(**kwargs)
```

等价于：

```python
weather_func(days=3, city="Bangkok")
```

Python 按参数名称绑定，所以字典顺序不重要：

```text
"city" → city
"days" → days
```

几个容易混淆的写法放在一起看：

```python
# 字典使用冒号，键是字符串
{"city": "Bangkok"}

# 函数调用使用等号，参数名不是字符串
weather_func(city="Bangkok")

# 展开字典
weather_func(**kwargs)

# 下面两种都是语法错误
weather_func("city"="Bangkok")
weather_func("city": "Bangkok")
```

上面的 `weather_func` 是未装饰的普通函数。加上 `@tool` 后，对应变量会变成 `StructuredTool`，对外应该这样执行：

```python
get_weather.invoke(kwargs)
```

不能再写 `get_weather(**kwargs)`。装饰器执行时，`StructuredTool` 把原始函数对象保存到 `func` 属性。`invoke()` 验证完参数后，工具内部做的事情近似于：

```python
self.func(*args, **kwargs)
```

如果参数名是 `location`，而函数需要 `city`，Pydantic 通常会先报告缺少 `city`、多出 `location`。即使绕过 Pydantic，Python 自己也会抛出 `unexpected keyword argument`。

## 工具返回后，模型看见什么

真实函数最初返回的是普通 Python 对象，可以是字符串、字典、列表或其他类型：

```python
result = {
    "city": "Bangkok",
    "temperature_c": 31,
    "condition": "rain",
}
```

如果只是用参数字典直接执行 `tool.invoke(...)`，某些调用路径会返回原始结果。通过完整 ToolCall 或 `ToolNode` 执行时，框架还拿到了 `tool_call_id`，于是可以生成：

```python
ToolMessage(
    name="get_weather",
    tool_call_id="call_123",
    status="success",
    content=(
        '{"city":"Bangkok",'
        '"temperature_c":31,'
        '"condition":"rain"}'
    ),
)
```

这里的 `content` 是包含 JSON 文本的 Python `str`，不是所谓的“JSON 类型”。框架会优先用 `json.dumps()` 序列化字典等结果，让它们能够进入消息协议。较大的原始结果可以放到 `ToolMessage.artifact` 或外部存储，只把模型真正需要的内容放进 `content`。

再次请求模型时，消息大致是：

```json
[
  {
    "role": "user",
    "content": "曼谷天气怎么样？"
  },
  {
    "role": "assistant",
    "content": null,
    "tool_calls": [
      {
        "id": "call_123",
        "type": "function",
        "function": {
          "name": "get_weather",
          "arguments": "{\"city\":\"Bangkok\"}"
        }
      }
    ]
  },
  {
    "role": "tool",
    "tool_call_id": "call_123",
    "content": "{\"city\":\"Bangkok\",\"temperature_c\":31}"
  }
]
```

模型不只读取 `content`。模型 API 同时接收 `role`、`tool_calls` 和 `tool_call_id` 等结构化字段。`tool_call_id` 把模型发出的某次调用与它的返回结果配成一对；并行执行多个工具时尤其需要它。

还有一个容易漏掉的边界：函数上的 `-> dict` 通常只是 Python 类型提示，不会自动验证返回结构。如果输出契约很重要，需要显式执行输出模型：

```python
class WeatherResult(BaseModel):
    city: str
    temperature_c: float
    condition: str


validated_result = WeatherResult.model_validate(result)
return validated_result.model_dump(mode="json")
```

即使结构通过验证，事实仍可能错误。`{"city": "FakeCity", "temperature_c": 31}` 的字段类型完全合法，但城市是否存在还得回到外部系统确认。

## 模型无状态，消息不会越来越长吗

标准模型 API 可以理解为无状态调用。每次请求时，应用都要重新提供这次推理所需的消息和工具定义。模型不会因为一分钟前调用过它，就自动记得之前发生了什么。

这不意味着每次都应该发送所有历史数据。需要区分三个概念：

| 概念             | 保存什么                     |
| ---------------- | ---------------------------- |
| Graph State      | 当前工作流保存的完整共享状态 |
| Model Context    | 本次真正发送给模型的内容     |
| Store / 外部存储 | 跨线程记忆或大型持久数据     |

State 里可以保存城市、原始天气数据、重试次数和旧消息；某次模型调用可能只需要最近几条消息、城市和天气摘要。

上下文持续增长会带来三个直接问题：超过窗口限制、增加成本和延迟、让无关内容干扰判断。常见处理方式包括：

- 只保留近期消息，对旧消息生成摘要。
- 把城市、订单号等关键事实提取成结构化 State。
- 大型搜索结果放入 artifact 或外部存储，按需检索。
- 根据当前任务选择相关记忆，而不是把长期记忆全部塞进 prompt。
- 保留成对的 ToolCall 和 ToolMessage，避免破坏 `tool_call_id` 关联。

“保存了什么”和“本次让模型看什么”是两道不同的设计题。

## State 应该放哪些字段

用户会提出什么问题无法提前穷举，所以 State 不应该为每一种可能的问法增加字段。判断一项数据要不要进入 State，可以问下面几个问题：

- 后续节点或下一轮追问是否需要精确读取它？
- 重新计算是否昂贵？
- 它是否影响条件路由、重试或审批？
- 中断恢复后是否仍然必须存在？
- 是否需要审计？

符合其中一项，通常就值得进入 State。一次性临时变量留在节点内部；跨线程的用户偏好放 Store；密钥和数据库连接放 Runtime Context；大型网页、文件或二进制数据放 artifact 或外部存储。

```text
节点临时变量       → 局部变量
当前任务共享数据   → Graph State
发送给模型的数据   → Model Context
大型原始结果       → Artifact / 外部存储
跨线程用户偏好     → Store，以 user_id 索引
密钥、数据库连接   → Runtime Context
```

领域变多后，可以保留一个通用 BaseState，再为不同子图增加领域字段：

```text
BaseState
├── messages
├── summary
├── status
└── error

WeatherState
├── city
├── date
└── units

OrderState
├── order_id
└── refund_reason
```

这里的 WeatherState 和 OrderState 不是要塞进同一个大 State，而是分别服务于天气子图和订单子图。

## `thread_id` 与 `user_id` 的区别

`thread_id` 是 Checkpointer 用来识别某次对话或任务的可恢复状态，可以把它理解成这次任务的存档编号：

```python
config = {
    "configurable": {
        "thread_id": "weather-session-001",
    }
}
```

下面三句话应该使用相同的 `thread_id`：

```text
用户：曼谷今天多少度？
用户：那明天呢？
用户：需要带伞吗？
```

后两句依赖第一句中的城市和任务上下文。用户开启全新的独立任务，或者产品明确要求隔离会话时，再创建新的 `thread_id`。

`user_id` 解决的是另一个问题：

```text
user_id   → 这个人是谁，用于跨线程的长期偏好
thread_id → 这是哪一次对话或任务，用于当前线程状态
```

同一个用户可以对应多个 `thread_id`。`user_id` 是应用自己定义的身份字段，常被用作 Store 的命名空间；它不像 `thread_id` 那样是 Checkpointer 自动识别的配置键。

复用 `thread_id` 也不会让模型自动看见 State。节点仍然要主动从 State 中选择历史消息或结构化字段，构造本次 Model Context。

## 回头检查当前代码

理解前面的边界后，`Dialogue_System.py` 中几个问题会变得很明显。

### `user_query` 保存错了

当前节点返回：

```python
return {
    "user_query": response.content,
    "search_query": search_query,
}
```

`response.content` 是模型对用户需求的理解，不是用户原始问题。后续回答节点看到的“用户问题”已经被改写了一次。更合理的是：

```python
return {
    "user_query": user_message,
    "search_query": search_query,
}
```

如果需要保存模型的理解，可以另建 `query_intent` 字段，不要复用 `user_query`。

### 搜索词依赖字符串切割

当前代码期待模型严格输出 `搜索词：`，然后执行：

```python
response_text.split("搜索词：")[1]
```

模型只要换一个冒号或调整格式，解析就可能失败。这里更适合结构化输出：

```python
class QueryUnderstanding(BaseModel):
    intent: str
    search_query: str
```

### 每次输入都创建了新 thread

当前代码执行：

```python
session_count += 1
thread_id = f"search-session-{session_count}"
```

这意味着“曼谷天气如何”和“那明天呢”会进入两个独立线程。即使把它们改成相同的 `thread_id`，当前 `understand_query_node` 仍然只提取最新一条 `HumanMessage`，再单独构造一个 `SystemMessage` 调用模型。它没有读取完整历史，也没有读取结构化的 `city`，所以仍然无法稳定理解“那明天呢”。

### `messages` 有 reducer，不代表模型读取了历史

```python
messages: Annotated[list, add_messages]
```

`add_messages` 只规定节点返回的新消息怎样合并到 State。最终给模型发送哪些消息，仍然由 `llm.invoke(...)` 中传入的内容决定。

### 节点返回的是状态更新，不必返回完整 State

当前三个节点都标注了 `-> SearchState`，实际却只返回自己修改的几个字段。LangGraph 本来就允许节点返回部分更新，运行时没有问题，但这个类型标注容易让静态检查器误以为所有字段都会返回。可以为节点结果单独定义 `total=False` 的 `TypedDict`，或者使用更符合实际的更新类型。

### `InMemorySaver` 只保存在当前进程

它适合本地开发和演示。进程退出后状态就消失了；生产环境需要数据库型 checkpointer，并考虑过期、隔离和数据清理。

这些问题不代表整个架构应该推倒重来。先决定产品究竟需要固定搜索流程，还是需要模型动态选择工具，再选择改法。

## 一个最小 Tool Calling Agent

下面的代码适配当前项目锁定的依赖版本，保留原来的 `.env`、`ChatOpenAI` 和 Tavily 配置，但把搜索注册成 Tool。新项目的导入路径和推荐入口可能已经变化，应以当前官方文档为准。

```python
import os
from typing import Literal

from dotenv import load_dotenv
from langchain_core.messages import SystemMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode
from pydantic import BaseModel, ConfigDict, Field
from tavily import TavilyClient


class SearchArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")

    query: str = Field(min_length=2, description="要搜索的关键词")
    limit: int = Field(default=5, ge=1, le=10)


load_dotenv()
tavily_client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])


@tool(args_schema=SearchArgs)
def search_web(query: str, limit: int = 5) -> dict:
    """搜索互联网中的最新资料。"""
    return tavily_client.search(
        query=query,
        max_results=limit,
        include_answer=True,
    )


tools = [search_web]
model = ChatOpenAI(
    model=os.getenv("LLM_MODEL_ID", "gpt-4o-mini"),
    api_key=os.environ["LLM_API_KEY"],
    base_url=os.getenv("LLM_BASE_URL", "https://api.openai.com/v1"),
)
model_with_tools = model.bind_tools(tools)


def call_model(state: MessagesState):
    response = model_with_tools.invoke(
        [
            SystemMessage(content="你是搜索助手，必要时调用搜索工具。"),
            *state["messages"],
        ]
    )
    return {"messages": [response]}


def route_after_model(
    state: MessagesState,
) -> Literal["tools", "__end__"]:
    last_message = state["messages"][-1]

    if last_message.tool_calls:
        return "tools"

    return END


builder = StateGraph(MessagesState)
builder.add_node("model", call_model)
builder.add_node("tools", ToolNode(tools))

builder.add_edge(START, "model")
builder.add_conditional_edges("model", route_after_model)
builder.add_edge("tools", "model")

app = builder.compile(checkpointer=InMemorySaver())
```

调用时为同一段对话复用 thread：

```python
config = {
    "configurable": {
        "thread_id": "search-session-001",
    }
}

app.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "搜索 LangGraph 最新的持久化方式",
            }
        ]
    },
    config=config,
)
```

这里的条件边检查模型是否产生 ToolCall：有就交给 `ToolNode`，没有就结束；工具执行完再回到模型。这就是常见的 `model → tools → model` 循环。

## 从 Demo 走向真实系统

Tool Calling 跑通只是起点。涉及真实数据或副作用时，还需要补上几道边界：

- 为输入定义明确 Schema；重要输出也要验证。
- 区分参数错误、工具临时失败和不可重试的业务错误。
- 写操作要考虑幂等，转账、删除和发送消息前增加人工审批。
- 独立工具可以并行，有依赖的工具必须保持顺序。
- 设置循环上限、超时和预算，防止模型反复调用。
- 使用持久化 checkpointer 支持恢复，并明确 `thread_id` 的生命周期。
- 控制 Model Context，避免把完整 State 无差别发送给模型。
- 记录每次模型输出、ToolCall、ToolMessage 和状态变化，方便定位问题。

模型负责做概率性的判断，框架负责确定性的边界。两者分工清楚，Agent 才不会真的变成盲盒。

## 最后

理解完整链路后，`@tool` 就不再神秘，模型也没有越过框架直接执行 Python。回到工程里，更值得问的是：哪些步骤必须固定，哪些判断可以交给模型？确定性强的任务用固定 workflow，路径需要动态选择时再引入 Tool Calling。这样设计出来的系统更容易解释，也更容易修。

## 参考资料

- [LangGraph Overview](https://docs.langchain.com/oss/python/langgraph/overview)
- [LangGraph Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api)
- [LangGraph Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
- [LangGraph Workflows and Agents](https://docs.langchain.com/oss/python/langgraph/workflows-agents)
- [LangChain Agents](https://docs.langchain.com/oss/python/langchain/agents)
- [LangChain Tools](https://docs.langchain.com/oss/python/langchain/tools)
- [LangChain Messages](https://docs.langchain.com/oss/python/langchain/messages)
- [LangChain Context Engineering](https://docs.langchain.com/oss/python/langchain/context-engineering)
- [Pydantic Models](https://docs.pydantic.dev/latest/concepts/models/)
- [Pydantic Fields](https://docs.pydantic.dev/latest/concepts/fields/)
- [Python JSON](https://docs.python.org/3/library/json.html)
- [Python Keyword Arguments](https://docs.python.org/3/tutorial/controlflow.html#keyword-arguments)
