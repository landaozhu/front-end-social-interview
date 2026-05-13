# instanceof 原理

以下内容整理自本仓库历史讨论稿。

沿实例的 `__proto__` 链向上查找，若与构造函数的 `prototype` 相遇则为真。

```javascript
function InstanceOf(inst, type) {
  if (typeof inst !== 'object') return false;
  while (true) {
    if (inst === null) return false;
    if (type.prototype === inst.__proto__) return true;
    inst = inst.__proto__;
  }
}
```

说明：`typeof null === 'object'`，因此需要循环内的 `null` 判断；工程里也可用 `Object.getPrototypeOf` 替代 `__proto__`，并注意 `Symbol.hasInstance` 等内置行为。
