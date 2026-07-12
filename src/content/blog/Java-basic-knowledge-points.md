---
title: "Java 基础知识点归纳"
description: "Java 基础知识点的归纳整理，涵盖集合、并发、JVM、Redis 与数据库一致性等高频主题，作为个人复习备查笔记。"
date: 2021-04-02T12:56:09.000Z
tags:
  - "java"
---

## 面向对象

- 怎么理解什么是面向对象？
- 怎么理解 Java 中封装、继承、多态？
- 为什么需要接口？

- 接口和抽象类的区别？

- Object 有哪些方法？9 个

- Object 中 hashcode 是干什么？

- Collection 集合容器迭代器 Itertor 是什么？

- “==”和 equals 区别？

- hashcode 和 equals 有什么联系

- 浅拷贝和深拷贝是什么 区别？

- Java 反射？

- Java 异常有哪些？

- Java 的 error 有哪些？

---

## Java 有哪些容器？（每个容器底层需要理解掌握 + 应用场景）

- HashMap 底层是怎样的？jdk1.7 和 1.8 有什么区别

- HashMap 怎么扩容的？

- HashMap 在扩容的时候插入元素会怎样？

- 为什么 HashMap 在多线程下会出现线程安全问题 - 死循环？
- ConcurrentHashMap 怎么实现线程安全的？jdk1.7 和 1.8

- LinkedHashMap 底层是怎样的，怎么实现有序插入？

---

## 进程和线程的区别？ps：协程是什么

- 进程的通信方式有哪些？哪个比较高效，为什么？

- 线程的通信方式有哪些？（线程通信指的是线程互斥同步）
- 线程有哪些状态？每个状态具体操作是？
- 如何创建线程？
- 继承 Thread 和实现 Runnable 区别
- 实现 Runnable 和 Callable 有什么区别
- 线程池有哪些？
- 线程池有哪些参数，每个代表什么？
- 线程池的拒绝策略有哪些？
- 线程池工作机制，每一步是怎样的？
- 有哪些阻塞队列？分别作用？
- CyclicBarrier、CountDownLatch、Semaphore 的用法
- start 和 run 的区别？
- wait 和 sleep 的区别？
- 如何解决多线程并发问题？加锁有哪些？
- synchronized 和 ReentrantLock 的区别
- 什么是 CAS、AQS 应用场景有哪里？
- CountDownLatch 是什么？
- ThreadLocal 是什么？（线程本地变量/存储）
- Java 内存模型是怎样的？
- Volatile 是解决什么问题？
- Volatile 和 Synchronized 区别
- synchronized 怎么优化加锁过程？锁升级、锁消除过程
- 什么是 AQS？（AbstractQueuedSynchronizer）
- 什么是乐观锁、悲观锁？

---

## Java 虚拟机

- 运行时数据区域<图> 各个区域分别的指责是什么？
- 垃圾回收？在哪些区域 GC？
- 如何判断一个对象是否可回收？
- GCRoot 包含哪些内容？
- 方法区的回收有哪些对象
- 垃圾回收算法有哪些？分别是怎样 GC 过程？分代收集算法指的是？
- 垃圾收集器有哪些？重点 CMS 和 G1 收集器（concurrent mark sweep）
- 回收策略：什么时候会发生 YoungGC / FullGC（场景）（考虑 Eden、Survivor）
- 什么时候会发生 FullGC？(Concurrent Mode Failure)（具体使用场景会是怎样会）
- 内存分配策略有哪些？对象分配优先在哪？如果是大对象尼？
- 是不是一收集完就开始 GC？为什么
- 类加载机制是怎样？每个步骤分别指责是？
- 类加载器有哪些？（三种）
- 什么是双亲委派模型？作用是什么？(可以加上自定义类加载器 extends ClassLoader 重写 findClass 方法)（ClassNotFoundException）
- 什么 NIO

---

## Spring

- Spring 和 SpringBoot 的区别
- Spring 的 IOC 和 AOP
- 依赖注入 DI 有哪些
- Spring 的实现事务的方式有哪些
- Spring 的事务传播级别有哪些
- Spring 的事务隔离级别有哪些
- @Autowird 怎么注入（类型 名称）
- Spring 中有哪些设计模式？分别有哪些
- Spring 的单例模式是严格的单例模式吗？为什么
- 有哪些方法可以实现单例模式？
- Spring 的三级缓存了解吗

---

## 数据库

- 数据库的事务特性？（四个）
- 事务并发一致性问题有哪些？分别过程是怎样？（丢失修改）
- 怎么分别解决并发一致性问题？
- 事务隔离级别有哪些？
- 什么是 MVCC？怎么解决并发一致性问题
- MVCC 解决了哪两种隔离级别？
- undo 日志用来干嘛？biglog 日志？redo 日志？
- 如何解决幻读问题？（在 X 隔离级别使用 XX 和 XX）
- Net-Key Lock 包含什么？
- 快照读和当前读的区别？
- 数据库三范式指的哪些？
- select where group by having
- inner join left join right join
- between order by 顺序
- SQL 优化有哪些？（结构优化 + 查询优化）
- MySQL 主从复制怎样实现？
- 为什么读写分离？
- 为什么需要分库分表？
- 怎样分库分表？
- 行级锁和表级锁？（基于索引）

---

## 索引

- MySQL 索引底层怎么实现的？
- 为什么使用 B+ 树而不是二叉搜索树或者红黑树？
- 聚簇索引和非聚簇索引是什么？
- 自适应哈希索引？
- 联合索引？最左匹配原则？
- 索引优化有哪些？（哪些情况下索引会失效？）
- 索引的优点有哪些？
- 索引使用条件，是不是越多越好？为什么
- 查询性能优化方式有哪些？
- innoDB 和 MyISAM 有什么区别？
- MySQL 数据类型有哪些（tinyint、smallInt、mediumInt、int、bigInt）[8,16,24,32,64 位]
- int（11）数字代表什么？

---

## Redis 的五大基本类型

- 键都是字符串，值是不同的对象类型
- Redis 的过期键删除策略有哪些（三种）分别是怎样，优缺点
- Redis 的持久化机制会有哪些（两种）分别是怎样的，优缺点
- 如果一边执行持久化机制，一边执行过期删除策略，redis 会是怎样的操作行为？
- Redis 的 AOF 是怎样实现？
- AOF 重写是怎样的？
- AOF 重写期间服务器进行命令处理，导致数据不一致怎么办？
- 为什么 Redis 支持高并发量，速度快？
- Redis 单线程是指的是什么单线程？
- Redis 分片有了解吗？
- Redis 怎么实现主从复制？
- Redis 的内存淘汰策略有哪些？
- Redis 中会出现哪些问题？（雪崩、击穿、穿透）
- 如何保证 redis 和 DB 数据一致性问题？

---

## RocketMQ

- RocketMQ 怎么实现这么高的吞吐量的？
- RocketMQ 怎么保证消息不丢失？
- RocketMQ 怎么保证消息不重复消费？
- RocketMQ 怎么保证消息的有序性？

---

## 补充

- Java 的序列化有哪些？
- 关于 spring 的问题补充
- rocketMQ 的问题补充
- mySQL 的问题
- Redis 的问题补充
- bitmap
- topK 的问题
- 场景设计题目补充

---

## SQL 和算法
