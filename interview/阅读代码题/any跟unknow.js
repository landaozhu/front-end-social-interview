请说下TS中unknown和any的区别，同时说说下面的代码是否会编译报错：
function getDog() {
  return '22'
}

const dog: unknown = getDog()
dog.hello() //Object is of type 'unknown'
export {}
