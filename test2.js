function throttle(fn, wait){
  let time = new Date()
  return function (...args){
    if(wait>new Date()-time){
      fn.call(this,...args)
      time = new Date()
    }
  }
}