data setter → Dep.notify → Watcher.update → queueWatcher → scheduler → Watcher.run → render → patch → DOM

追问：

为什么连续修改 10 次数据，不会立即更新 10 次 DOM？
queueWatcher 怎么去重？
scheduler 什么时候 flush？
nextTick 在这条链路里到底处于什么位置？
DOM patch 完成是不是等于浏览器已经 Paint？
为什么 nextTick 里通常可以读取新的 DOM 尺寸？