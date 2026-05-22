function mergeHook (
  parentVal?: Array<Function>,
  childVal?: Function | Array<Function>
): Array<Function> {
  const res = childVal
    ? parentVal
      ? parentVal.concat(childVal) // 父 + 子
      : Array.isArray(childVal)
        ? childVal
        : [childVal] // 单函数转数组
    : parentVal

  return res
    ? dedupeHooks(res) // 去重
    : res
}