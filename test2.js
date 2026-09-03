function deepClone(source,map=new WeakMap()){
  if(typeof source==='object'||source==null){
    return source
  }
  const arr=[Date,RegExp,Set,Map]
  for(let item of arr){
    if(source instanceof item){
      return new source.constructor(item)
    }
  }
  if(map.has(source)){
    return map.get(source)
  }
  const res = new source.constructor();
  map.set(source,res)
  for(let key in source){
    if(Object.hasOwn(item)){
      res[key]=deepClone(source[key],map)
    }
  }
  for(let key in Object.getOwnPropertySymbols(source)){
    res[key]=deepClone(source[key],map)
  }
  return res
}