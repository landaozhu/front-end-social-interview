class EventEmitter{
  constructor(){
    this.events=new Map()
  }
  removeAllListeners(key,cb){
    this.events.delete(key)
    cb&&cb()
  }
  off(fn){
    this.events.filter(item=>item!==fn)
  }
  once(key,fn){
    const onceFn=(...args)=>{
      fn&&fn(...args)
      this.off(key)
    }
    this.on(key,onceFn)
  }
  emit(key){
    for(let fn of this.events.get(key)){
      fn&&fn()
    }
  }
  on(key,fn){
    if(this.events.has(key)&&fn){
      this.events.set(key,(this.events.get(key)||[]).concat(fn))
    }
  }
}