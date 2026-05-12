// var tree={
//   value:4,
//   left:{
//     value:2,
//     left:{
//       value:1
//     },
//     right:{
//       value:3
//     }
//   },
//   right:{
//     value:5
//   }
// }
class Tree {
  constructor(val) {
    this.left = null
    this.right = null
    this.val = val
  }
}
class BST {
  constructor() {
    this.tree = null;
    this.sortRes=[]
  }
  // 构造二叉搜索树 O(NlogN)
  renderABST(arr) {
    arr.forEach(element => {
      this.addItem(this.tree, element)
    });
    return this.tree
  }
  addItem(tree, item) {
    if (tree != null) {
      if (tree.val >= item) {
        if (tree.left == null) {
          tree.left = new Tree(item)
        } else {
          this.addItem(tree.left, item)
        }
      } else {
        if (tree.right == null) {
          tree.right = new Tree(item)
        } else {
          this.addItem(tree.right, item)
        }
      }
    } else {
      this.tree = new Tree(item)
    }
  }
  includes(arr,item) {
    this.tree=null
    this.tree=this.renderABST(arr)
    return this.find(this.tree, item)
  }
  //O(logN)
  find(tree, item) {
    if (tree == null) {
      return false
    }
    if (tree.val === item) {
      return true
    } else if (item < tree.val) {
      return this.find(tree.left, item)
    } else if (item > tree.val) {
      return this.find(tree.right, item)
    }
  }
  // O(logN)
  sort(arr){
   this.tree=[]
   this.renderABST(arr);
    this.sortRes=[];
    this.inOrder(this.tree)
    return this.sortRes
  }
  //O(N)
  inOrder(tree){
    if(tree==null){
      return
    }
    this.inOrder(tree.left)
    tree.val&&this.sortRes.push(tree.val)
    this.inOrder(tree.right)
  }
  findByIndex(arr,index){
    return this.sort(arr)[index]
  }
  remove(item){
    const cur=this.tree
    let parent=null
    while(cur!=null){
      if(cur.val===item){
        parent=cur
        this.removeNode(this.tree,parent)
        return
      }
    }
  }
  removeNode(tree,parent){
    if(tree==parent)
  }
}
var bst = new BST();

console.log(bst.includes([6, 1, 7, 5, 2, 3, 4, 8],1))
console.log(bst.sort([6, 1, 7, 5, 2, 3, 4, 8]))
console.log(bst.findByIndex([6, 1, 7, 5, 2, 3, 4, 8],3))
var tree = bst.renderABST([6, 1, 7, 5, 2, 3, 4, 8])
// bst.remove(3)
console.log(tree)