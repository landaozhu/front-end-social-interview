const _ = require("lodash");
function cloneDeep(source, map = new WeakMap()) {//map解决循环引用
  if (map.get(source)) { 
    return map.get(source);
  }
  //基础数据类型
  if (typeof source !== "object" || source == null) {
    return source;
  }
  const types = [Date, Map, Set, RegExp];
  if (types.includes(source.constructor)) return new source.constructor(source);
  //   //正则
  //   if (source instanceof RegExp) return new RegExp(source);
  //   //日期
  //   if (source instanceof Date) return new Date(source);
  //   //set
  //   if (source instanceof Set) {
  //     const newSet = new Set();
  //     source.forEach((item) => {
  //       newSet.add(cloneDeep(item));
  //     });
  //     return newSet;
  //   }

  //map
  //   if (source instanceof Map) {
  //     const newMap = new Map();
  //     source.forEach((value, key) => {
  //       newMap.set(key, cloneDeep(value));
  //     });
  //     return newMap;
  //   }

  //和要拷贝的对象保持类一致，例如对象或数组
  const res = new source.constructor();

  map.set(source, res);

  for (let key in source) {
    if (Object.prototype.hasOwnProperty.call(source,key)) {
      res[key] = cloneDeep(source[key], map);
    }
  }

  //处理symbol作为对象属性的情况
  const symbolKeys = Object.getOwnPropertySymbols(source);
  for(let key of symbolKeys){
    res[key] = deepClone(source,map)
  }
  return res;
}

var weakmap = new WeakMap();
weakmap.set({}, 3);
var lwpsy = Symbol("lwp");
var map = new Map();
map.set("a", 1);
map.set("b", 2);
var a = {
  //   weakmap,
  map,
  fn: () => {},
  date: new Date(),
  set: new Set("adsf"),
  weakSet: new WeakSet([[2, 3]]),
  un: undefined,
  sy: Symbol(1),
  [lwpsy]: { xx: "xx" },
  arr: [1, 34],
  reg: new RegExp(/[1-9]/),
  //   err: new Error(),
};
var b = { r: a };
// a.r = b;
var clone = cloneDeep(a);
// var clone = _.cloneDeep(a);
console.log(
  clone,
  a.sy === clone.sy,
  clone.date.getTime(),
  typeof clone.lwpsy,
  typeof lwpsy
);
