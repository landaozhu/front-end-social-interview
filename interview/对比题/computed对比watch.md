## 目标
computed：如果复杂计算，在模版里太臃肿，而且不能抽象
watch：做一些副作用的处理（dom、接口请求）
## 特性
computed：缓存机制，计算结果不变返回缓存结果、无副作用
watch：能对新值旧值对比
## 定义
computed：必须有返回值
## 原理
computed：自动依赖收集
watch：手动指定监听源
## 执行时机
computed：懒执行，用到才计算
watch：监听源数据变更后，同步立即执行回调
## 应用场景
# 补充
watchEffect可以不用手动监听
watch可以使用immediate在初始化执行
# 追问
哪些场景绝对不能用 computed？
1.有副作用
2.新旧值对比
watch 和 watchEffect 怎么选、区别在哪？
watchEffect会对函数里面的依赖进行自动收集，无需手动监听
computed 缓存完整流程是什么？