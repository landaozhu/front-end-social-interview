class EventEmitter {
  constructor() {
    this.events = {
     
    };
  }
  on(name, fn) {
    this.events[name] ? this.events[name].push(fn) : (this.events[name] = [fn]);
  }
  emit(name, ...args) {
    const fns = this.events[name];
    fns.forEach((fn) => fn && fn(...args));
  }
  once(name, fn) {
    const onceFn = (...args) => {
      fn && fn(...args);
      this.removeListener(name);
    };
    this.on(name, onceFn);
  }
  removeListener(name, callback) {
    this.events[name] = [];
    callback && callback();
  }
}
const eventEmitter = new EventEmitter();
eventEmitter.on("ifEat", (food = "饭") => {
  console.log(`吃${food}了吗`);
});
eventEmitter.emit("ifEat", "香蕉");
eventEmitter.emit("ifEat");

eventEmitter.once("ifSleep", () => {
  console.log("睡了吗");
});
eventEmitter.emit("ifSleep");
eventEmitter.emit("ifSleep");

// eventEmitter.on("ifGoOut", () => {
//   console.log("出来玩呀");
// });
eventEmitter.removeListener("ifGoOut", () => {
  console.log("ifGoOut取消监听");
});
eventEmitter.emit("ifGoOut");
