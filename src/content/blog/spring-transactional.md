---
title: "Spring 事务最佳实践【Java 版】"
description: "在开发需求采用 Java 声明式事务对两个对象插入两张表 下方代码编写，单测发现事务失效（release 对象插入成功，action 插入失败，但事务没有回滚，release 对象还是插入成功）"
date: 2023-11-28T01:34:00.000Z
tags:
  - "java"
---

## 背景

在开发需求采用 Java 声明式事务对两个对象插入两张表
下方代码编写，单测发现事务失效（release 对象插入成功，action 插入失败，但事务没有回滚，release 对象还是插入成功）

```java
@Slf4j
@Service
public class xxService {

    public String xxx(xxRequest request) throws JsonProcessingException {
         // 参数校验
         checkParam(request);
         // 前置查询校验信息...
         //省略 xxx 多行代码解析和 build 逻辑
         // ....

        ReleaseEntity release =
            buildReleaseEntity(xxx);

        String reason = request.getReason();
        ActionEntity action = buildActionEntity(xxx);
        // 执行 db 操作
execute(release, action)
        // 返回执行记录 id
        return action.getUid();
    }

    @Transactional(rollbackFor = Exception.class)
    public void execute(ReleaseEntity release, ActionEntity action) {
        try {
          // 新增 release
releaseService.create(release);
          // 新增 action
actionService.create(action);
        } catch (BizException | JsonProcessingException ex) {
              throw new BizException("执行流量分发报错，请重试 err:" + ex.getMessage());
        }
      }
}

@Slf4j
@Service
public class ReleaseService {
    @Resource
    private ReleaseMapper releaseMapper;

public void create(ReleaseEntity entity ) throws JsonProcessingException {
        log.info("新增执行版本 entity:{}", JsonUtils.getMapper().writeValueAsString(entity));
        try {
            releaseMapper.insertSelective(entity);
        } catch (Exception e) {
            throw new BizException(String.format("新增执行版本，请重试 err:%s", e.getMessage()));
        }
    }

    public List<ReleaseEntity> getReleaseListByPlanId(String planId) {
        return releaseMapper.getReleaseListByPlanId(planId);
    }
}

@Slf4j
@Service
public class ActionService {
  @Resource private ActionMapper actionMapper;
public void create(ActionEntity entity) throws JsonProcessingException {
    log.info("新增执行记录 entity:{}", JsonUtils.getMapper().writeValueAsString(entity));
    try {
      actionMapper.insertSelective(entity);
    } catch (Exception e) {
      throw new BizException(String.format("新增执行记录报错，请重试 err:%s", e.getMessage()));
    }
  }
}
```

## 排查经过

尝试：将数据库操作函数代码放在函数 distribute 中，在 distribute 方法上增加@Transactional 注解

结论：执行单测，事务没有失效，成功事务回滚没有问题

> 疑问思考：是不是 spring 方法中传递事物有什么黑魔法？如果按照这样写能实现需要会不会大事务（原则：尽可能事务的开启在 db 操作代码前后，尽可能缩小事务影响范围），还是 spring 会在运行到 db 操作代码时候，智能的开启事务和提交事务？？

```java
@Slf4j
@Service
public class RgwService {

@Transactional(rollbackFor = Exception.class)
    public String distribute(DistributeRequest request) throws JsonProcessingException {
         // 参数校验
         checkDistributeParam(request);
         // 前置查询校验预案信息...
         //省略 xxx 多行代码解析和 build 逻辑
         // ....

        ReleaseEntity release =
            buildReleaseEntity(planId, newParam, description, operator, curReleaseVersion);

        String reason = request.getReason();
        ActionEntity action = buildActionEntity(planId, release.getUid(), reason, operator);
        // 执行 db 操作
execute(release, action)
try {
          // 新增 release
          releaseService.create(release);
          // 新增 action
          actionService.create(action);
         } catch (BizException | JsonProcessingException ex) {
              throw new BizException("执行流量分发报错，请重试 err:" + ex.getMessage());
            }
          }
        // 返回执行记录 id
        return action.getUid();
    }

}
```

## 问题根因

由于使用 Spring AOP 代理造成的，因为只有当事务方法被当前类以外的代码调用时，才会由 Spring 生成的代理对象来管理
ps：在 springAOP 的用法中，只有代理的类才会被切入，我们在 controller 层调用 service 的方法的时候，是可以被切入的，但是如果我们在 service 层 A 方法中，调用 B 方法，切点切的是 B 方法，那么这时候是不会切入的

## 解决方式

### 使用编程式事务管理

在这种方式下，我们显式地管理事务，手动开启、提交和回滚事务，确保 methodA 和 methodB 都能在自己的事务中执行

| 优点 |
| ---- |

| 1. 更细粒度的控制控制事务影响范围  
 2. 方便处理条件式回滚可以 3. 手动处理特定的异常 |

| 缺点 |
| ---- |

| 1. 代码冗余：开启事务、提交事务、回滚事务和异常处理等 2. 可读性差：事务的边界和处理通常会散布在业务逻辑中 |

```java
@Service
public class MyService {

    @Autowired
    private PlatformTransactionManager transactionManager;

    public void methodA() {
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        TransactionStatus status = transactionManager.getTransaction(def);
        try {
            // 执行一些业务逻辑
            // 调用 methodB
            methodB();
            transactionManager.commit(status);
        } catch (Exception e) {
            transactionManager.rollback(status);
            throw e;
        }
    }

    @Transactional
    public void methodB() {
        // 执行一些业务逻辑
        // 抛出异常
        throw new RuntimeException("Something went wrong");
    }
}
```

<br>

### 拆分到不同的类中

通过将 methodA 和 methodB 拆分到不同的类中，每个方法都有自己的代理，事务注解不会相互影响，可以正常工作。

| 优点                                                                            |
| ------------------------------------------------------------------------------- |
| 简单明了，易于维护，不需要复杂的额外配置；不需要显式的编程式事务管理或 AOP 配置 |

| 缺点                       |
| -------------------------- |
| 容易冗余多个类，职责不清晰 |

```java
@Service
public class MyService {

    @Autowired
    private MyOtherService otherService;

    @Transactional
    public void methodA() {
        // 执行一些业务逻辑
        // 调用 MyOtherService 中的 methodB
        otherService.methodB();
    }
}

@Service
public class MyOtherService {

    @Transactional
    public void methodB() {
        // 执行一些业务逻辑
        // 抛出异常
        throw new RuntimeException("Something went wrong");
    }
}
```

### 使用 ApplicationContext 获取当前代理对象

使用 ApplicationContext 来获取 Bean 的实例，从而确保事务生效；就是在该类中自动注入本类 bean，使用@Autowired 即可，然后使用这个注入的 bean 去调用本类方法，即可达到两方法事务都起效

| 优点                                            |
| ----------------------------------------------- |
| 不需要引入额外的配置或依赖于特定的 AOP 框架功能 |

| 缺点 |
| ---- |

| 1. 潜在性能问题：一定的性能开销，因为它需要在运行时动态确定 Bean 的实例  
2. 可读性差：读者可能难以理解为什么需要在同一个类中的方法之间使用它 3. 潜在的递归问题：需要小心避免在同一个方法内部产生无限递归调用问题，导致栈溢出异常 |

```java
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MyService implements ApplicationContextAware {

private ApplicationContext applicationContext;

@Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }

    @Transactional
    public void methodA() {
        // 执行一些业务逻辑
        // 获取 MyService 的代理实例
        MyService proxy = applicationContext.getBean(MyService.class);
        // 调用 methodB
        proxy.methodB();
    }

    @Transactional
    public void methodB() {
        // 执行一些业务逻辑
        // 抛出异常
        throw new RuntimeException("Something went wrong");
    }
}
```

### 使用 AopContext.currentProxy() 获取当前代理对象【推荐】

methodA 中使用了 AopContext.currentProxy() 获取了当前代理对象，并调用了 methodB。这样，methodB 将会在相同的事务中执行，而不会失效

| 优点                                           |
| ---------------------------------------------- |
| 简化代码；避免了不必要的类拆分和编程式事务代码 |

| 缺点 |
| ---- |

| 1. 潜在性能问题：引入一定的性能开销，因为它需要在运行时动态确定代理对象。这可能对高性能应用程序产生一定影响，特别是在高并发 case 2. 线程安全问题：可能会引入线程安全问题，因为它涉及到共享状态（当前代理对象）。在多线程应用中，需要谨慎使用，并确保适当的同步机制可读性差 |

```java
import org.springframework.aop.framework.AopContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@EnableAspectJAutoProxy(proxyTargetClass = true, exposeProxy = true)
public class MyService {

    @Transactional
    public void methodA() {
        // 执行一些业务逻辑
        // 调用 methodB
        MyService proxy = (MyService) AopContext.currentProxy();
        proxy.methodB();
    }

    @Transactional
    public void methodB() {
        // 执行一些业务逻辑
        // 抛出异常
        throw new RuntimeException("Something went wrong");
    }
}
```

## 其他资料

![Spring 声明式事务失效问题的调试截图](https://cdn.jsdelivr.net/gh/hi-Ernest/imgbed/images/202312052347147.png)
