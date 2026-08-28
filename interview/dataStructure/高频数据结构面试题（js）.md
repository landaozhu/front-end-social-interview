# 高频数据结构面试题（js）

> 来源: https://juejin.cn/post/7270799939725639720

.markdown-body{word-break:break-word;line-height:1.75;font-weight:400;font-size:16px;overflow-x:hidden;color:#252933}.markdown-body h1,.markdown-body h2,.markdown-body h3,.markdown-body h4,.markdown-body h5,.markdown-body h6{line-height:1.5;margin-top:35px;margin-bottom:10px;padding-bottom:5px}.markdown-body h1{font-size:24px;line-height:38px;margin-bottom:5px}.markdown-body h2{font-size:22px;line-height:34px;padding-bottom:12px;border-bottom:1px solid #ececec}.markdown-body h3{font-size:20px;line-height:28px}.markdown-body h4{font-size:18px;line-height:26px}.markdown-body h5{font-size:17px;line-height:24px}.markdown-body h6{font-size:16px;line-height:24px}.markdown-body p{line-height:inherit;margin-top:22px;margin-bottom:22px}.markdown-body img{max-width:100%}.markdown-body hr{border:none;border-top:1px solid #ddd;margin-top:32px;margin-bottom:32px}.markdown-body code{word-break:break-word;border-radius:2px;overflow-x:auto;background-color:#fff5f5;color:#ff502c;font-size:.87em;padding:.065em .4em}.markdown-body code,.markdown-body pre{font-family:Menlo,Monaco,Consolas,Courier New,monospace}.markdown-body pre{overflow:auto;position:relative;line-height:1.75}.markdown-body pre>code{font-size:12px;padding:15px 12px;margin:0;word-break:normal;display:block;overflow-x:auto;color:#333;background:#f8f8f8}.markdown-body a{text-decoration:none;color:#0269c8;border-bottom:1px solid #d1e9ff}.markdown-body a:active,.markdown-body a:hover{color:#275b8c}.markdown-body table{display:inline-block!important;font-size:12px;width:auto;max-width:100%;overflow:auto;border:1px solid #f6f6f6}.markdown-body thead{background:#f6f6f6;color:#000;text-align:left}.markdown-body tr:nth-child(2n){background-color:#fcfcfc}.markdown-body td,.markdown-body th{padding:12px 7px;line-height:24px}.markdown-body td{min-width:120px}.markdown-body blockquote{color:#666;padding:1px 23px;margin:22px 0;border-left:4px solid #cbcbcb;background-color:#f8f8f8}.markdown-body blockquote:after{display:block;content:""}.markdown-body blockquote>p{margin:10px 0}.markdown-body ol,.markdown-body ul{padding-left:28px}.markdown-body ol li,.markdown-body ul li{margin-bottom:0;list-style:inherit}.markdown-body ol li .task-list-item,.markdown-body ul li .task-list-item{list-style:none}.markdown-body ol li .task-list-item ol,.markdown-body ol li .task-list-item ul,.markdown-body ul li .task-list-item ol,.markdown-body ul li .task-list-item ul{margin-top:0}.markdown-body ol ol,.markdown-body ol ul,.markdown-body ul ol,.markdown-body ul ul{margin-top:3px}.markdown-body ol li{padding-left:6px}.markdown-body .contains-task-list{padding-left:0}.markdown-body .task-list-item{list-style:none}@media (max-width:720px){.markdown-body h1{font-size:24px}.markdown-body h2{font-size:20px}.markdown-body h3{font-size:18px}}.markdown-body pre,.markdown-body pre>code.hljs{color:#333;background:#f8f8f8}.hljs-comment,.hljs-quote{color:#998;font-style:italic}.hljs-keyword,.hljs-selector-tag,.hljs-subst{color:#333;font-weight:700}.hljs-literal,.hljs-number,.hljs-tag .hljs-attr,.hljs-template-variable,.hljs-variable{color:teal}.hljs-doctag,.hljs-string{color:#d14}.hljs-section,.hljs-selector-id,.hljs-title{color:#900;font-weight:700}.hljs-subst{font-weight:400}.hljs-class .hljs-title,.hljs-type{color:#458;font-weight:700}.hljs-attribute,.hljs-name,.hljs-tag{color:navy;font-weight:400}.hljs-link,.hljs-regexp{color:#009926}.hljs-bullet,.hljs-symbol{color:#990073}.hljs-built_in,.hljs-builtin-name{color:#0086b3}.hljs-meta{color:#999;font-weight:700}.hljs-deletion{background:#fdd}.hljs-addition{background:#dfd}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:700}
## 栈



### 定义


栈是一种特殊的线性表，只能在栈顶进行操作，有先进后出的特性



### 实现



```
/**
 * push(item:string) 添加元素到栈顶
 * pop():item 弹出栈顶元素
 * top():item 返回栈顶元素
 * isEmpty():boolean 判断是否为空
 * size():number 返回栈里元素的个数
 * clear() 清空栈
 */
class Stack {
  constructor() {
    this.items = [];
  }
  push(item) {
    this.items.push(item);
  }
  pop() {
    return this.items.pop();
  }
  isEmpty() {
    return this.items.length === 0;
  }
  top() {
    this.item[this.size() - 1];
  }
  size() {
    return this.items.length;
  }
  clear() {
    this.items = [];
  }
}
```



### 练习


1.合法括号
括号成对出现，才能合法



```
sdf(ds(ew(we)rw)rwqq)qwewe //合法
(sd(qwqw)sd(sd)) //合法
()()sd()(sd()fw))( //不不合法
```


实现



```
function isLeaglBrackets(str) {
  const stack = new Stack();
  for (let i = 0; i < str.length; i++) {
    const item = str[i];
    if (item === "(") {
      stack.push(item);
    } else if (item === ")") {
      if (stack.isEmpty()) {
        return false;
      }
      stack.pop();
    }
  }
  return stack.isEmpty();
}
```



### 应用场景




- 浏览器历史记录：通过栈实现浏览器的前进后退功能

- 路由管理：在单页面应用（SPA）中，实现路由切换及页面状态管理

- 括号匹配：检查代码中括号是否合法

- 函数调用堆栈：实现函数调用时的上下文切换

- 表达式求值：解析和计算数学表达式

- JavaScript 事件循环：浏览器使用任务队列和调用栈实现异步操作




## 队列



### 定义


队列是一种特殊的线性表，只允许在队列的头部删除元素，在队列的尾部添加元素



### 实现



```
class Queue {
  constructor() {
    this.items = [];
  }
  enqueue(item) {
    this.items.push(item);
  }
  dequeue() {
    return this.items.shift();
  }
  head() {
    return this.items[0];
  }
  size() {
    return this.items.length;
  }
  clear() {
    this.items = [];
  }
  isEmpty() {
    return this.items === 0;
  }
}
```



### 练习


队列实现斐波那契约数

```
/**
 * 思路：
 * 1.把两个1放到队列中
 * 2.使用while循环，用index计数，循环终止条件index<n-2
 * 3.dequeue方法删除头部的一个元素，得到元素delItem
 * 4.head方法得到headItem
 * 5.del+headItem放到队尾
 * 6.index++
 */
function fabonacci(n) {
  const queue = new Queue();
  if (n === 1 || n === 2) {
    return 1;
  }
  queue.enqueue(1);
  queue.enqueue(1);
  let index = 0;
  while (index < n - 2) {
    const delItem = queue.dequeue();
    const headItem = queue.head();
    queue.enqueue(delItem + headItem);
    index++;
  }
  queue.dequeue();
  return queue.head();
}
```



## 链表



### 定义


链表是物理存储单元上非连续的、非顺序的存储结构，由一系列节点构成。



### 相关概念解释


链表有有头、无头、单向、双向、带哨兵位、不带哨兵位、循环和非循环 这几种


节点：节点有两部分，一个是数据，一个是指向下一个节点的指针


首尾节点：链表中的第一个节点是首节点，最后一个节点是尾节点


无头链表：第一个节点既有数据又有指针


有头链表：第一个节点没有数据有指针


带哨兵位：在一条链表的前面,有一个空的节点不存放任何的值，只存放头节点的地址和尾节点的地址


双指针：指的是在遍历元素的过程中，不是使用单个指针进行访问，而是使用两个指针进行访问，从而达到相应的目的。如果两个指针方向相反，则称为「对撞时针」。如果两个指针方向相同，则称为「快慢指针」。如果两个指针分别属于不同的数组 / 链表，则称为「分离双指针」。


双向链表





循环链表






### 应用场景


单向链表


- 撤销功能（单向链表的删除操作，文本、图形编辑器，聊天的撤销）

- 实现图、hashMap 等一些高级数据结构



双向链表


- 比如编辑器的「undo/redo」



循环链表


- 操作系统的分时问题 分时操作系统

- 约瑟夫环（单向循环链表）一文让你秒懂“约瑟夫环问题”

- 提高 Node 的 Timer 模块的性能（双向循环链表）Timer 模块




## 树



### 概念介绍




- 树：一种非线形的数据结构，由 n(n>=0)个节点组成的集合。


- 如果 n=0，则是空树

- 如果 n>0，树有一个特殊的节点，这个节点没有父节点，则被称为根节点

- 除根节点之外的其余元素被称为 m(m>=0)互不相交的集合 T1，T2，...Tm-1，其中每一个集合 Ti(1<=i<=m)本身也是一棵树，被称为原树的子树

- 节点：包含数据和指针

- 节点的度：节点所拥有的子树的数量

- 叶节点：度为 0， 如上图中的 5 7 8 9 10 11

- 分支节点：除了叶节点就是分支节点（包括根节点） 如上图中的 1 2 3 4

- 子女节点：若节点 x 有子树，则这颗子树的根节点就是节点 x 的子女节点，例如 2 3 4 都是 1 的子女节点

- 父节点：若节点 x 有子女节点，则 x 为子女节点的父节点，例如 1 是 2 3 4 的父节点，2 是 5 6 的父节点

- 兄弟节点：同一个父节点的子女节点互称为兄弟， 如 5 和 6 是兄弟节点

- 祖先节点：从根节点到该节点所进过分支上的所有节点，如节点 5 ，它的祖先节点为 1 2

- 子孙节点：某一个节点的子女，以及这些子女的子女都是该节点的子孙节点，如节点 2 ，5 6 11 都是它的子孙节点

- 节点所在的层次

- 树的深度：树中距离根节点最远的节点所处的层次就是树的深度，上图中，树的深度是 4

- 树的高度：叶节点的高度为 1，非叶节点的高度是它的子女节点高度的最大值加 1，高度与深度数值相等，但计算方式不一样，上图中树的

- 树的度：树中节点的度的最大值，上图中，所有节点的度的最大值是 3，树的度就是 3

- 有序树：树中节点的各棵字树 T1，T2...是有次序的，T1 是第 1 棵子树，T2 是第 2 棵子树

- 无序树：树中节点的各棵子树之间的次序不重要，可以互相交换位置

- 森林：森林是 m(m>=0)棵树的集合

- 二叉树：二叉树是树的一种特殊情况，每个节点最多有有两个子女，分别称为该节点的左子女和右子女，就是说，在二叉树中，不存在度大于 2 的节点。二叉树的子树有左右之分，次序不能颠倒
 - 二叉树的性质 - 在二叉树的第 i(i>=1)层，最多有 2i-1 个节点 - 深度为 k(k>=0)的二叉树，最少有 k 个节点，最多有 2k-1 个节点 - 对于一棵非空二叉树，叶节点的数量等于度为 2 的节点数量加 1（例如上图，叶节点数量为 4，度为 2 度节点数量为 3（1，2，3），加一刚好等于 4） - 满二叉树：深度为 k 的满二叉树，是有 2k-1 个叶节点的二叉树，每一层都达到了可以容纳的最大数量的节点
 - 完全二叉树：深度为 k 的完全二叉树，从第 1 层到第 k-1 层都是满的，第 k 层，或是满的或是从右向左连续缺若干个节点




### 代码实现


定义节点

```
class BinTreeNode {
  constructor(data) {
    this.data = data;
    this.leftChild = null;
    this.rightChild = null;
    this.parentNode = null;
  }
}
```


定义二叉树类
用广义表构建二叉树
什么是广义表，例如 A(B(D,E(G,)),C(,F))#




- 广义表的表名放在表前，表示树的根节点，括号中的是根的左右子树

- 每个节点的左右子树用逗号隔开，如果有仅有右子树没有左子树，逗号不省略

- 整个广义表的最后加上特殊符号#表示输入结束







```
//分析：这里有括号嵌套，所以用栈来识别
//用k来做识别，遇到左括号，表示开始识别左子树，k=1，遇到逗号，表示开始识别右子树
//遇到左括号，表示前面的数是根节点，压栈，遇到右括号，表示一棵子树结束，弹出
class BinaryTree {
  constructor(str) {
    this.root = null;
    this.initTree(str);
  }
  initTree(str) {
    const stack = new Stack();
    let newNode = null;
    let k = 0;
    for (let i = 0; i < str.length; i++) {
      const item = str[i];
      if (item === "#") {
        break;
      }
      if (item === "(") {
        k = 1;
        stack.push(newNode);
      } else if (item === ")") {
        stack.pop();
      } else if (item === ",") {
        k = 2;
      } else {
        newNode = new BinTreeNode(item);
        if (!this.root) {
          this.root = newNode;
        } else if (k === 1) {
          const topItem = stack.top();
          topItem.leftChild = newNode;
          newNode.parentNode = topItem;
        } else if (k === 2) {
          const topItem = stack.top();
          topItem.rightChild = newNode;
          newNode.parentNode = topItem;
        }
      }
    }
  }
}
```


中序遍历：左根右
DBGEACF


递归



```
#inOrder(node) {
    if (node == null) {
      return;
    }
    this.#inOrder(node.leftChild);
    console.log(node.data);
    this.#inOrder(node.rightChild);
  }
```


非递归：while+stack



```
inOrderByWhileAndStack() {
    const stack = new Stack();
    let currNode = this.#root;
    while (currNode) {
      stack.push(currNode);
      if (!currNode.leftChild) {
        const node = stack.pop();
        console.log(node.data);
        currNode = stack.pop();
      }
      if (currNode.rightChild) {
        stack.push(currNode.rightChild);
      }
    }
  }
```


前序遍历:根左右
ABDEGCF
递归



```
#preOrder(node) {
    if (node == null) {
      return;
    }
    console.log(node.data);
    this.#preOrder(node.leftChild);
    this.#preOrder(node.rightChild);
  }
```



```
preOrderByWhileAndStack() {
    const stack = new Stack();
    let currNode = this.#root;
    while (currNode) {
      console.log(currNode.data);
      if (currNode.rightChild) {
        stack.push(currNode.rightChild);
      }
      if (currNode.leftChild) {
        currNode = currNode.leftChild;
      } else {
        currNode = stack.pop();
      }
    }
  }
```


后序遍历：左右根
DGEBFCA
递归



```
#postOrder(node) {
    if (node == null) {
      return;
    }
    this.#postOrder(node.leftChild);
    this.#postOrder(node.rightChild);
    console.log(node.data);
  }
```


非递归(双栈法)



```
postOrderByWhileAnd2Stacks() {
    const stack = new Stack();
    stack.push(this.#root)
    const outputStack = new Stack();
    while(!stack.isEmpty()){
      const currNode=stack.pop();
      outputStack.push(currNode)
      currNode.leftChild&&stack.push(currNode.leftChild)
        currNode.rightChild&&stack.push(currNode.rightChild)
    }
    while(!outputStack.isEmpty()){
      console.log(outputStack.pop().data)
    }
  }
```


节点数量



```
size() {
  return this.#treeNodeCount(this.#root);
}
#treeNodeCount(node) {
  if (!node) {
    return 0;
  }
  const leftCount = this.#treeNodeCount(node.leftChild);
  const rightCount = this.#treeNodeCount(node.rightChild);
  return leftCount + rightCount + 1;
}
```


高度



```
height() {
  return this.#treeHeight(this.#root);
}
#treeHeight(node) {
  if (!node) {
    return 0;
  }
  const leftHeight = this.#treeHeight(node.leftChild);
  const rightHeight = this.#treeHeight(node.rightChild);
  return leftHeight > rightHeight ? leftHeight + 1 : rightHeight + 1;
}
```


查找节点



```
#findNode(node, data) {
    if (!node) {
      return null;
    }
    if (node.data === data) {
      return node;
    }
    const leftRes = this.#findNode(node.leftChild, data);
    if (leftRes) {
      return leftRes;
    }
    return this.#findNode(node.rightChild, data);
  }
  find(data) {
    return this.#findNode(this.#root, data);
  }
```



## 定义


堆是特殊的完全二叉树，即除了最后一层，其他节点都是满的，并且有序，分为最大堆和最小堆。在优先级队列的各种实现中，堆是最高效的一种数据结构
最大堆：所有的子节点，右节点小于子节点且根值是最大值
最小堆：所有的子节点，右节点大于子节点且根值是最小值



## 应用场景




- 创建动态数组

- 优先队列，时间复杂度O(logn)

- 排序算法，时间复杂度O(logn)

- 在图算法中，堆常用于实现Dijkstra算法和Prim算法



深度优先遍历
尽可能深的搜索树的分支
思路：递归



```
var tree={
  val:1,
  children:[
    {
      val:2,
      children:{
        val:3
      }
    },{
      val:4
    }
  ]
}
const dfs = (root) => {
  console.log(root.val);
  root.children?.forEach(dfs)
}
dfs(tree)
```


广度优先遍历
一层一层遍历



```
/**
 * 思路：新建一个队列，把根节点放到队列
 * 每次把头节点拿出来，打印，把children放到队列去
 * 重复如此操作，直到队列为空
 */
var tree={
  val:1,
  children:[
    {
      val:2,
      children:[{
        val:3
      }]
    },{
      val:4
    }
  ]
}
const bfs = (root) => {
  const queue = [root];
  while(queue.length>0){
    const head = queue.shift();
    console.log(head.val);
    head.children?.forEach(child=>queue.push(child))
  }
}
bfs(tree)
```