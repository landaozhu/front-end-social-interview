class Compiler extends Tapable {
  constructor(context) {
    super();
    this.hooks = {
      // 在 Compiler 初始化完毕且插件已注册之后调用
      // 用于准备环境变量等（初始化早期阶段）
      initialize: new SyncHook([]),              // 🧱 初始化 Compiler 时触发

      // 配置 entry 后被触发，如果返回 true 会中断内置 entry 处理
      entryOption: new SyncBailHook(["context", "entry"]), // 🔌 处理 entry 配置

      // 在插件初始化完成后触发
      afterPlugins: new SyncHook(["compiler"]),   // 🧩 所有插件已注册

      // 在解析器和其它内部工具准备完毕后调用
      environment: new SyncHook([]),              // 🌍 环境准备阶段
      afterEnvironment: new SyncHook([]),         // ✔ 环境准备完成
      afterResolvers: new SyncHook(["compiler"]), // 🔍 解析器（resolver）初始化后

      // ----- 构建开始前生命周期钩子 -----

      // 在 run 之前调用（异步串行）
      beforeRun: new AsyncSeriesHook(["compiler"]), // 🏁 在 run 之前

      // 当 run 被调用时触发，build 过程开始
      run: new AsyncSeriesHook(["compiler"]),       // ▶ 建立编译过程

      // watch 模式下触发，watch 重新开始编译时
      watchRun: new AsyncSeriesHook(["compiler"]),  // 👀 监听模式下的 run

      // ----- Compilation 创建阶段 -----

      // 在开始创建新 compilation 之前
      beforeCompile: new AsyncSeriesHook(["params"]), // 🧠 before compile

      // 在 compile 阶段触发（同步），compile 就是生成 compilation
      compile: new SyncHook(["params"]),            // 📦 compile 开始

      // 当 Compilation 实例创建出来时触发
      thisCompilation: new SyncHook(["compilation", "params"]), // ↪ Compilation 被创建

      // 当 Compilation 实例创建完毕，作为 plugin 的入口
      compilation: new SyncHook(["compilation", "params"]),  // 🪄 进入 compilation

      // 执行 make 阶段（主要用 compilation 递归构建模块）
      make: new AsyncParallelHook(["compilation"]),   // 🛠 make 阶段触发（构建依赖）
      
      // make 结束时执行
      finishMake: new AsyncSeriesHook(["compilation"]), // ✔ make 完成

      // Compilation 结束之后触发
      afterCompile: new AsyncSeriesHook(["compilation"]), // 🧾 after compile

      // ----- Emit & 输出阶段 -----

      // 是否产出资源？返回 false 可阻止输出
      shouldEmit: new SyncBailHook(["compilation"]),     // 📌 是否 emit

      // 生成 asset 前（异步串行）
      emit: new AsyncSeriesHook(["compilation"]),        // 🗂 emit 之前

      // 每个资源写入后触发
      assetEmitted: new AsyncSeriesHook(["file", "info"]),// 🖨 单个资源 emit

      // Emit 之后执行
      afterEmit: new AsyncSeriesHook(["compilation"]),   // 📬 emit 完成

      // ----- 完成相关 -----

      // 整个 build 结束（成功）时触发
      done: new AsyncSeriesHook(["stats"]),               // 🎉 build 成功

      // done 之后（同步）
      afterDone: new SyncHook(["stats"]),                 // 🧹 done 后

      // 编译失败时触发
      failed: new SyncHook(["error"]),                    // ❌ build 失败

      // ----- Watch 模式相关 -----

      // 当文件变化使编译失效时触发
      invalid: new SyncHook(["filename", "changeTime"]),  // 🔄 失效

      // watch 停止时
      watchClose: new SyncHook([]),                       // 🛑 watch 关闭

      // 关闭编译器，资源清理
      shutdown: new AsyncSeriesHook([]),                  // 🧨 compiler 关闭

      // 其他内部日志相关（用于 infrastructure logging）
      infrastructureLog: new SyncBailHook([
        "origin",
        "type",
        "args",
      ]),                                                 // 📝 日志钩子
    };

    // 其余构造器内部属性初始化 ...
  }
}
/**
 * 
 * ✨ 钩子类型解释（为什么这么分类）
Hook 类型	意味着什么	何时用
SyncHook	同步执行	不需要 async
SyncBailHook	同步执行，可提前中断	用来“返回值阻止默认行为”
AsyncSeriesHook	异步串行执行	多个回调顺序执行（如 beforeRun → run → …）
AsyncParallelHook	异步并行执行	任务可以同时执行（如 make 阶段）

这四种类型对应 webpack 基于 Tapable 的插件系统机制。

🌀 钩子作用简要说明
构建前
entryOption → 处理入口配置
beforeRun / run → 构建开始前设置
watchRun → watch 模式下触发
构建过程
beforeCompile → compile 之前
compile → compile 开始
thisCompilation / compilation → compilation 对象生成
make → 构建所有模块依赖
finishMake → make 结束
afterCompile → compile 阶段结束
输出阶段
shouldEmit → 是否输出文件
emit / afterEmit → 写入输出文件前后
assetEmitted → 每个资产写入后
构建完成
done → 成功结束
afterDone → done 之后
failed → 失败时触发
Watch & Other
invalid → 变更触发 watch
watchClose → 监听结束
shutdown → 关闭 compiler
infrastructureLog → 内部日志系统钩子
🧠 面试实用提示
Compiler Hooks 是 webpack 最重要的扩展点，插件就是注册到这些 hook 上。
这是 webpack 核心插件机制实现的基础。
许多常见插件（如 HtmlWebpackPlugin、DefinePlugin、EntryPlugin）实际上就是在这些钩子上注册 callback 来改变编译行为。
make / compilation / emit / done 等是整个编译生命周期的主要阶段。
 */