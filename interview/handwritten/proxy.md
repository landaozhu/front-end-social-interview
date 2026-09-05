# 手写简易 Proxy（不再提问）

**2026-09-04 从一面抽题剔除。** 真 `Proxy` 是引擎 trap，**不是** `Object.defineProperty` 实现的，也 polyfill 不了（Vue 3 放弃 IE 就是这个原因）。用 `defineProperty` 仿一个 `MyProxy` 会把面试口径讲反，不要再练这题。

下面旧稿仅归档，不要背「底层是 defineProperty」。

---

先来实现最基本的功能

```js
const person = {
  name: "lwp",
};
const obj = new Proxy(person, {
  get: function (target, propKey, receiver) {
    console.log("get");
    return target[propKey];
  },
  set: function (target, propKey, value, receiver) {
    console.log("set");
    target[propKey] = value;
  },
});
obj.name = "pxh";
console.log(obj.name);
```

```js
class MyProxy {
  constructor(target, handle) {
    const newTarget = deepcClone(target);
    Object.keys(newTarget).forEach(function (key) {
      Object.defineProperty(newTarget, key, {
        get: function () {
          return handle.get && handle.get(target, key);
        },
        set: function (newVal) {
          handle.set && handle.set(target, key, newVal); //target如果换成newTarget就会变成死循环
        },
      });
    });
    return newTarget;
  }
}
```

## 参考

[简易实现](https://blog.csdn.net/shabbyaxe/article/details/111876095)
