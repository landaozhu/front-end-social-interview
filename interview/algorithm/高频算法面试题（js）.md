# 高频算法面试题（js）

> 来源: https://juejin.cn/post/7270799939725623336

.markdown-body{word-break:break-word;line-height:1.75;font-weight:400;font-size:16px;overflow-x:hidden;color:#252933}.markdown-body h1,.markdown-body h2,.markdown-body h3,.markdown-body h4,.markdown-body h5,.markdown-body h6{line-height:1.5;margin-top:35px;margin-bottom:10px;padding-bottom:5px}.markdown-body h1{font-size:24px;line-height:38px;margin-bottom:5px}.markdown-body h2{font-size:22px;line-height:34px;padding-bottom:12px;border-bottom:1px solid #ececec}.markdown-body h3{font-size:20px;line-height:28px}.markdown-body h4{font-size:18px;line-height:26px}.markdown-body h5{font-size:17px;line-height:24px}.markdown-body h6{font-size:16px;line-height:24px}.markdown-body p{line-height:inherit;margin-top:22px;margin-bottom:22px}.markdown-body img{max-width:100%}.markdown-body hr{border:none;border-top:1px solid #ddd;margin-top:32px;margin-bottom:32px}.markdown-body code{word-break:break-word;border-radius:2px;overflow-x:auto;background-color:#fff5f5;color:#ff502c;font-size:.87em;padding:.065em .4em}.markdown-body code,.markdown-body pre{font-family:Menlo,Monaco,Consolas,Courier New,monospace}.markdown-body pre{overflow:auto;position:relative;line-height:1.75}.markdown-body pre>code{font-size:12px;padding:15px 12px;margin:0;word-break:normal;display:block;overflow-x:auto;color:#333;background:#f8f8f8}.markdown-body a{text-decoration:none;color:#0269c8;border-bottom:1px solid #d1e9ff}.markdown-body a:active,.markdown-body a:hover{color:#275b8c}.markdown-body table{display:inline-block!important;font-size:12px;width:auto;max-width:100%;overflow:auto;border:1px solid #f6f6f6}.markdown-body thead{background:#f6f6f6;color:#000;text-align:left}.markdown-body tr:nth-child(2n){background-color:#fcfcfc}.markdown-body td,.markdown-body th{padding:12px 7px;line-height:24px}.markdown-body td{min-width:120px}.markdown-body blockquote{color:#666;padding:1px 23px;margin:22px 0;border-left:4px solid #cbcbcb;background-color:#f8f8f8}.markdown-body blockquote:after{display:block;content:""}.markdown-body blockquote>p{margin:10px 0}.markdown-body ol,.markdown-body ul{padding-left:28px}.markdown-body ol li,.markdown-body ul li{margin-bottom:0;list-style:inherit}.markdown-body ol li .task-list-item,.markdown-body ul li .task-list-item{list-style:none}.markdown-body ol li .task-list-item ol,.markdown-body ol li .task-list-item ul,.markdown-body ul li .task-list-item ol,.markdown-body ul li .task-list-item ul{margin-top:0}.markdown-body ol ol,.markdown-body ol ul,.markdown-body ul ol,.markdown-body ul ul{margin-top:3px}.markdown-body ol li{padding-left:6px}.markdown-body .contains-task-list{padding-left:0}.markdown-body .task-list-item{list-style:none}@media (max-width:720px){.markdown-body h1{font-size:24px}.markdown-body h2{font-size:20px}.markdown-body h3{font-size:18px}}.markdown-body pre,.markdown-body pre>code.hljs{color:#333;background:#f8f8f8}.hljs-comment,.hljs-quote{color:#998;font-style:italic}.hljs-keyword,.hljs-selector-tag,.hljs-subst{color:#333;font-weight:700}.hljs-literal,.hljs-number,.hljs-tag .hljs-attr,.hljs-template-variable,.hljs-variable{color:teal}.hljs-doctag,.hljs-string{color:#d14}.hljs-section,.hljs-selector-id,.hljs-title{color:#900;font-weight:700}.hljs-subst{font-weight:400}.hljs-class .hljs-title,.hljs-type{color:#458;font-weight:700}.hljs-attribute,.hljs-name,.hljs-tag{color:navy;font-weight:400}.hljs-link,.hljs-regexp{color:#009926}.hljs-bullet,.hljs-symbol{color:#990073}.hljs-built_in,.hljs-builtin-name{color:#0086b3}.hljs-meta{color:#999;font-weight:700}.hljs-deletion{background:#fdd}.hljs-addition{background:#dfd}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:700}
## 冒泡排序


冒泡排序会一直比较相邻的两个数，如果顺序错误，就会进行交换。之所以叫冒泡，是因为不停交换，最后结果就会冒出来。



### 算法步骤




- 比较相邻的元素。如果第一个比第二个大，就交换他们两个。

- 对每一对相邻元素作同样的工作，从开始第一对到结尾的最后一对。这步做完后，最后的元素会是最大的数。

- 针对所有的元素重复以上的步骤，除了最后一个。

- 持续每次对越来越少的元素重复上面的步骤，直到没有任何一对数字需要比较。




```
function bubbleSort(arr) {
  let exchange;
  for (let i = 0; i < arr.length; i++) {
    exchange = false; // 标识是否有数据交换
    for (let j = 0; j < arr.length - i; j++) {
      if (arr[j] > arr[j + 1]) {
        exchange = true;
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
    if (!exchange) return arr;
  }
  return arr;
}
```


平均时间复杂度 O(N2)


当数组已经有序时，一个循环下来没有位置交换，排序结束，时间复杂度为 O(n)。


当数组是逆序时，内循环一共要执行 (n-1)+(n-2)+...+1=n*(n-1)/2，即时间复杂度为 O(n2)。



## 快速排序


快速排序是从冒泡排序改进的，本质也是通过替换来的，比冒泡快，所以叫快速排序。
下面介绍左右指针法，其他方法还有挖坑法、前后指针法，可以看这里


1、选取基准，例如选取第一个元素作为基准，申明左右指针分别指向数组的头尾


2、将右指针向左移动，当当前元素小于基准时停下


3、将左指针向右移动，当当前元素大于基准时停下


4、将两个指针的值进行交换


5、循环 2-4 步骤，直到左右指针相遇


6、将基准值跟指针指向位置的值进行交换

至此，基准的左边元素都小于等于基准，基准的右边元素都大于等于基准，再递归将左右子数组也按照刚才的步骤处理即可。



```
function quickSort(arr) {
  quick_sort(arr, 0, arr.length - 1);
  return arr;
}
function quick_sort(arr, start, end) {
  if (start >= end) {
    return;
  }
  let reference = arr[start];
  let p1 = start;
  let p2 = end;
  while (p1 < p2) {
    if (p1 < p2 && arr[p2] >= reference) {
      p2--;
    }
    if (p1 < p2 && arr[p1] <= reference) {
      p1++;
    }
    if (p1 < p2) {
      let temp = arr[p1];
      arr[p1] = arr[p2];
      arr[p2] = temp;
    }
  }
  arr[start] = arr[p1];
  arr[p1] = reference;
  quick_sort(arr, start, p1 - 1);
  quick_sort(arr, p1 + 1, end);
}
```


平均时间复杂度 O(NlogN)


快速排序是递归的，每一次递归，都需要将递归调用时的上线文环境保存到栈中，最大递归调用次数是 log2n
， 因此存储开销为 O(nlog2n)


最坏的情况下，待排序序列已经是有序的，这样，进行一次分区后，只得到一个分区，这个分区里的元素个数比上一次少一个元素，如此，需要 n-1 次分区，第一次分区需要遍历 n-1 个元素才能完成分区，第二次需要 n-2 次比较，第三次需要 n-3 次比较，最后一次需要 1 次比较，总的比较次数就是 n*(n-1)/2，约等于 n2 /2，时间复杂度为 O( n2 )。
最好的情况 O(NlogN)



## 二分查找


在一个有序的序列中，要查找一个元素，我们不需要遍历一遍，而是通过二分法，先找个中间值，如果等于中间值，就找到了，如果比中间值小，就在左边序列去找，如果比中间值大，就去右边找，一旦找到，就返回。


虽然二分查找跟快排都是分治法，把大问题拆成小问题，但是一旦在小问题解决，整体就解决。



```
function binarySearch(arr, target, left, right) {
  if (left > right) {
    return false;
  }
  const middle = Math.floor((right + left) / 2);
  if (arr[middle] === target) {
    return true;
  } else if (arr[middle] > target) {
    return binarySearch(arr, target, left, middle - 1);
  } else {
    return binarySearch(arr, target, middle + 1, right);
  }
}
function isInArray(arr, target) {
  return binarySearch(arr, target, 0, arr.length - 1);
}
```


时间复杂度 O(logN)
最快 O(1)
最慢 O(N)
空间复杂度 O(1)



## 动态规划


和递归相反的技术


通常都会用一个数组来建立一张表，解决每个子问题，最终大问题就会得到解决


核心思想：拆分子问题，记住过往，减少重复计算



### 解题




- 斐波那契数列
[1,1,2,3,5...]




```
function feibonacici(n) {
  if (n === 1 || n === 2) {
    return 1;
  }
  const arr = [1, 1];
  for (let i = 2; i < n; i++) {
    arr[i] = arr[i - 1] + arr[i - 2];
  }
  return arr[n - 1];
}
```




- 青蛙跳台阶
一只青蛙一次可以跳上 1 级台阶，也可以跳上 2 级台阶。求该青蛙跳上一个 n 级的台阶总共有多少种跳法。




```
function frogJump(n) {
  if (n < 1) {
    return 0;
  }
  if (n === 1) {
    return 1;
  } else if (n === 2) {
    return 2;
  } else {
    const arr = [1, 2];
    for (let i = 2; i < n; i++) {
      arr[i] = arr[i - 1] + arr[i - 2];
    }
    return arr[n - 1];
  }
}
```



## 参考




- JavaScript 实现十大排序算法（图文详解）

- 动图介绍排序算法之冒泡排序

- O(log(N))是什么意思

- 抖音-快速排序执行顺序-填坑法

- 图解快速排序的三种方式

- 写二分查找不得不注意的细节！！！说三遍

- 青蛙跳台阶