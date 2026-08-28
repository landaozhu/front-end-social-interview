# localStorage用起来很麻烦，封装一个吧

> 来源: https://juejin.cn/post/7273026570940366887

window.localStorage存在很多问题，比如每次都得序列化和反序列化



```hljs js code-block-extension-codeShowNum
localStorage.setItem('xxx',JSON.stringify({name:'lwp'}))
JSON.parse(localStorage.getItem('xxx'))
```


一旦出现报错就会影响后续程序运行，也没有过期。
也没发现有很好的库，因此决定自己封装一个。


首先解决反序列化与序列化问题



```hljs js code-block-extension-codeShowNum
class LanLocalStorage{
    constructor(){
        
    }
    set(item,obj){
        localStorage.setItem(item,JSON.stringify(obj))
    }
    get(item){
        JSON.parse(localStorage.getItem(item))
    }
}
const localStorage = new LanLocalStorage();
localStorage.set('xx',{name:'lwp'})
```


然后是报错问题，这里我设置了回调，如果有埋点需求，可以在callback埋埋点。



```hljs js code-block-extension-codeShowNum
class LanLocalStorage{
    constructor(){
        
    }
    set(item,obj,callback){
        try {
            localStorage.setItem(item,JSON.stringify(obj))
        } catch (error) {
            callback(error,item,obj)
        }
    }
    get(item,callback){
        let value = localStorage.getItem(item)
        try {
          value = JSON.parse(value);
        } catch (error) {
          callback(error, item, value);
        }
        return value;
    }
}
```


为了提供全局callback，这里用一个单例模式，写个init函数。



```hljs js code-block-extension-codeShowNum
class LanLocalStorage{
    instance
    constructor(callback){
        this.callback = callback;
    }
    set(item, obj, callback) {
        try {
          localStorage.setItem(item, JSON.stringify(obj));
        } catch (error) {
          callback && callback(error, item, obj);
          this.callback && this.callback("set", error, item, obj);
        }
    }
    get(item, callback) {
        let value = localStorage.getItem(item);
        try {
          value = JSON.parse(value);
        } catch (error) {
          callback && callback(error, item, value);
          this.callback && this.callback("get", error, item, value);
        }
        return value;
    }
    static init(callback) {
    if (!LanLocalStorage.instance) {
      LanLocalStorage.instance = new LanLocalStorage(callback);
      console.log(LanLocalStorage.instance);
    }
    return LanLocalStorage.instance;
  }
}
```


用法就得改变



```hljs js code-block-extension-codeShowNum
export const localStorage = LanLocalStorage.init(()=>{
    //全局埋点
})
```


在自己项目全局写这段代码，并且其他地方引用localStorage


然后是过期时间。


这里我的思路是，set的时候设置时间戳，get的时候判断是否过期，如果过期，再删除，返回null。



```hljs js code-block-extension-codeShowNum
class LanLocalStorage {
  instance;
  constructor(options = {}) {
    const { errCb, timeout } = options;
    this.errCb = errCb;
    this.timeout = timeout;
    this.timeoutList = {};
  }
  getTimeOut(value) {
    //正则匹配
    if (typeof value === "string") {
      if (value.match(/day$/)) {
        const day = +value.match(/^[1-9][0]/g);
        return day * DAY_1_MILLISECOND;
      }
    } else {
      return value;
    }
  }
  set(item, obj, options = {}) {
    const { callback, timeout = this.timeout } = options;
    if (timeout) {
      //重复设置,则重新计时
      this.timeoutList[item] = {
        saveTime: new Date().getTime(),
        timeout: this.getTimeOut(timeout),
      };
    }
    //...
  }
  get(item, callback) {
    if (this.timeoutList[item]) {
      const { saveTime, timeout } = this.timeoutList[item];
      //过期
      if (saveTime + timeout > new Date().getTime()) {
        localStorage.removeItem(item);
        return undefined;
      }
    }
    //...
  }
}
```



```hljs js code-block-extension-codeShowNum
export const localStorage = LanLocalStorage.init({
  timeout: "30day", //默认全局30天
});
```


以上就是我的封装，具体代码放[这里](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Flanweipeng%2FfullAnswer%2Fblob%2Fmaster%2Farticle%2Fcode%2FlocalStorage.js)