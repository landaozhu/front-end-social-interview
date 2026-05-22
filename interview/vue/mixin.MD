
合并原理
1. data：普通对象会递归 merge，冲突 key 子覆盖父。优先级：组件 > 局部 mixin > 全局 mixin。
注意：只有普通对象递归合并，数组、函数、Date 等不会深度 merge。
2. methods / computed / components / directives / filters：对象浅合并，冲突 key 后者覆盖前者。优先级：组件 > 局部 mixin > 全局 mixin。
3. 生命周期钩子：合并成数组，不覆盖，执行顺序：全局 mixin > extends > 局部 mixin（按数组顺序）> 组件，并且会去重。
4. watch：同名 watch 不覆盖，也会合并成数组，执行顺序一般也是：全局 mixin > extends > 局部 mixin > 组件。
5. 递归点：递归不是 mergeHook，而是 mergeOptions 处理 extends、mixins 时递归合并，所以 mixin 里面还能继续写 mixin。

源码
mergeOptions:https://github1s.com/vuejs/vue/blob/main/src/core/util/options.ts

 
## 参考
- [阿里P8前端架构师亲授：Vue2+Vue3框架，30小时横扫一切关于VUE的问题，深入理解VUE源码，吊打所有敢于提问Vue问题的面试官！-mixin](https://www.bilibili.com/video/BV1Kw411v7z2/?share_source=copy_web&vd_source=40278a06741ff2b84390493be5b9c7b6)