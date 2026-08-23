class EventEmitter {
  constructor() {
    // key:事件名，value:回调函数数组
    this.events = new Map();
  }

  // 订阅事件
  on(eventName, callback) {
    // 校验回调必须是函数
    if (typeof callback !== 'function') return this;
    // 当前事件无队列则初始化空数组
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    const callbacks = this.events.get(eventName);
    // 去重，避免同一函数重复注册多次触发
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
    }
    // 支持链式调用
    return this;
  }

  // 触发事件，透传任意多个参数
  emit(eventName, ...args) {
    const callbacks = this.events.get(eventName);
    // 无对应事件直接返回false
    if (!callbacks?.length) return false;
    // 拷贝数组，防止emit过程中增删回调导致遍历错乱
    [...callbacks].forEach(fn => fn(...args));
    return true;
  }

  // 解绑单个事件的指定回调
  off(eventName, callback) {
    if (!this.events.has(eventName) || typeof callback !== 'function') return this;
    const callbacks = this.events.get(eventName);
    // 过滤目标回调
    const newCallbacks = callbacks.filter(item => item !== callback);
    if (newCallbacks.length) {
      this.events.set(eventName, newCallbacks);
    } else {
      // 无剩余回调，删除key释放内存
      this.events.delete(eventName);
    }
    return this;
  }

  // 仅执行一次，执行完自动解绑
  once(eventName, callback) {
    if (typeof callback !== 'function') return this;
    // 包装一层用于解绑
    const wrapper = (...args) => {
      this.off(eventName, wrapper);
      callback(...args);
    };
    // 挂载原函数，便于外部匹配解绑
    wrapper.origin = callback;
    return this.on(eventName, wrapper);
  }

  // 清空指定事件/全部事件（原生标准方法）
  removeAllListeners(eventName) {
    if (eventName === undefined) {
      // 不传参：清空所有事件
      this.events.clear();
    } else {
      // 传参：清空该事件所有回调
      this.events.delete(eventName);
    }
    return this;
  }
}

// 面试配套测试用例（写出来大幅加分）
const bus = new EventEmitter();
const fn1 = (a, b) => console.log('普通监听', a, b);

bus.on('hello', fn1);
bus.once('hello', (x) => console.log('一次性监听', x));

console.log('第一次触发');
bus.emit('hello', 100, 200);
console.log('第二次触发（once已销毁）');
bus.emit('hello', 100, 200);

// 解绑单个回调
bus.off('hello', fn1);
bus.emit('hello', 100, 200);

// 重新注册测试清空
bus.on('hello', fn1);
bus.removeAllListeners('hello');
bus.emit('hello', 100, 200);
