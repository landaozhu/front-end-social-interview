## call和apply的区别
 call是逐个提供的参数，apply是数组或者类数组对象

## call、apply 和 bind 的区别
1. bind 不会立即执行函数，而 call、apply 会立即执行
2. bind可以创建一个具有预设初始参数的函数
```
function list(...args) {
  return args;
}

function addArguments(arg1, arg2) {
  return arg1 + arg2;
}

console.log(list(1, 2, 3)); // [1, 2, 3]

console.log(addArguments(1, 2)); // 3

// 创建一个带有预设前导参数的函数
const leadingThirtySevenList = list.bind(null, 37);

// 创建一个带有预设第一个参数的函数。
const addThirtySeven = addArguments.bind(null, 37);

console.log(leadingThirtySevenList()); // [37]
console.log(leadingThirtySevenList(1, 2, 3)); // [37, 1, 2, 3]
console.log(addThirtySeven(5)); // 42
console.log(addThirtySeven(5, 10)); // 42
//（最后一个参数 10 被忽略）
```