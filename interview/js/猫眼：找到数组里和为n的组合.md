# 猫眼：找到数组里和为n的组合

> 来源: https://juejin.cn/post/7290826271831638051

```hljs js code-block-extension-codeShowNum
/**
 * 给定一个候选人编号的集合 candidates 和一个目标数 target ，找出 candidates 中所有可以使数字和为 target 的组合。candidates 中的每个数字在每个组合中只能使用 一次 。
 * 注意：解集不能包含重复的组合。

  示例 1:
    输入: candidates = [10,1,2,7,6,1,5], target = 8,
    输出:
    [
      [1,1,6],
      [1,2,5],
      [1,7],
      [2,6]
    ]
  示例 2:

  输入: candidates = [2,5,2,1,2], target = 5,
  输出:
  [
    [1,2,2],
    [5]
  ]
 * 
 */
```


第一步：排序
第二步：深度遍历
第三步：去重



```hljs js code-block-extension-codeShowNum
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */ 
function findGentle(candidates,target){
  candidates = candidates.filter(item=>item<=target).sort((a,b)=>a-b)
  let arr=[];
  function findPossibility(target,temp,start){
    if(target<0){
      return
    }
    if(target===0){
      arr.push(temp)
      return
    }
    for(let i=start;i<candidates.length;i++){
      const item = candidates[i];
        findPossibility(target-item,[...temp,item],i+1)
    }
  }
  findPossibility(target,[],0)
  return deduplicateArr(arr);
}
function deduplicateArr(arr){
  let strArr = arr.map(item=>item.join(''));
  strArr = Array.from(new Set(strArr))
  const res = strArr.map(item=>{
    const array = item.split('');
    return array.map(i=>+i)
  })
  return res;
}

console.log(findGentle([2,5,2,1,2],5))
console.log(findGentle([10,1,2,7,6,1,5],8))
```



## 参考




- [从JavaScript中的数组中查找所有可能的组合](https://link.juejin.cn/?target=https%3A%2F%2Fwww.nhooo.com%2Fnote%2Fqa0ytj.html)