/**
 * 重要程度分级：2026 趋势 + 兰为鹏简历画像（6年前端 / 上海）
 *
 * 原则：简历没写、项目没碰的，面试官通常不会深挖 → 降级
 * 简历核心卖点 → 保持或升高优先级
 */

const IMPORTANCE_WEIGHT = { P0: 10, P1: 5, P2: 1.5, P3: 0.25 };
const IMPORTANCE_LABEL = {
  P0: 'P0 必考',
  P1: 'P1 高频',
  P2: 'P2 了解',
  P3: 'P3 冷门',
};

/** 过时 / 非独立面试题 */
const P3_RE =
  /雪碧图|sprite|双飞翼|圣杯布局|圣杯|兼容IE|IE6|IE7|IE8|doctype|块级元素|内联元素|伪数组转数组|0\.5px|jquery|JQ三者|html新特性|新特性$|语义化标签|ready和onload|onload和domcontentloaded|scss$|jade|float|三栏布局|viewpost|slepp|style-loader|less-loader|ZipPlugin|TerserPlugin|dayjs和moment|xlsx|react-quill|harness|cursor|skill|SOP|专业度|习惯|自测与质量|击鼓传花|随机验证码|数组顺序|10000个数据|场景题|git 进阶|百度外包|百姓网|猫眼：|表达结构|页面初始化/i;

/**
 * 用户点名必考。自动分级曾把 lock / package.json / enum / 精度打成 P2，
 * 灰度 / SSR / useMemo 停在 P1，uniapp / 网络攻击甚至没进题库。
 */
const USER_P0_RE =
  /路由模式|hash.*history|history.*hash|vue2和vue3|vue2跟vue3|vue2&vue3|vue和react|react和vue|setState|setstate|渲染机制|ssr|灰度|uni-?app|useMemo|useCallback|useMomo|React\.memo|react\.memo|react18|数组额外|define[Pp]roperty|fcp|useLayoutEffect|webpack原理|为什么要有lock|package\.json|lockfile|package-lock|devDependencies|网络攻击|interface跟type|interface和type|type跟enum|type和enum|decical|decimal|浮点数|虚拟dom|虚拟DOM/i;

const P0_RE =
  /eventloop|event loop|事件循环|nexttick|nextTick|响应式|vue3|vue 3|vue2和vue3|composition|编译优化|patchFlag|静态提升|事件缓存|useEffect|useLayoutEffect|hooks|虚拟dom|virtual dom|diff|fiber|setState|redux|vuex|webpack|HMR|热更新|打包|构建|tree shaking|代码分割|import\(\)|首屏|FCP|性能优化|渲染|重排|重绘|回流|跨域|cors|jsonp|缓存|协商缓存|强缓存|http|https|tcp|udp|url输入|中间件|洋葱|koa|egg|node.*event|微前端|iframe|模块联邦|module federation|xss|csrf|网络攻击|typescript|middleware|深拷贝|debounce|节流|防抖|promise|eventEmitter|call、apply、bind|闭包|必包|原型链|原型和原型|this|模块化|esModules|commonjs|computed对比watch|watch.*computed|路由模式|为什么不用iframe|instanceof|ajax|async|await|proxy|ref|reactive|生命周期|组件通信|组件之间|react18|react 18|mixin|slot|插槽|vue更新|beforeDestroy|插件|异步组件|Context|HOC|受控组件|自定义hook|performance|单线程|浏览器结构|渲染瓶颈|contentType|headers|http状态码|存储|微任务|宏任务|setTimeout|懒加载|预加载|Koa 洋葱|Node Event Loop|浏览器 Event Loop|useMemo|useCallback|ssr|灰度|uni-?app/i;

const P1_RE =
  /flex|bfc|盒模型|position|移动端适配|CSS选择器|css3动画|硬件加速|垂直居中|隐藏元素|长度单位|伪类|伪元素|rem|viewport|transform|dom$|对象$|数组的方法|箭头函数|严格模式|作用域|new做了什么|深拷贝|浅拷贝|手写|observer|可选链|localStorage|bind区别|interface|高级类型|方法重载|ts有啥|react原理|pureComponent|memo|父组件|子组件|事件系统|为什么要用虚拟|webpack原理|常用配置|提高打包|减少包体积|打包构建|HMR原理|node中的|什么是中间件|什么是洋葱|设计模式|事件冒泡|捕获|Object和Map|数组和set|new\.md|proxy\.md|promise\.md|Etag|vite对比webpack|eslint|分包|按需加载|qiankun|umi|ant-design|java.*bff|bff|jest|lighthouse|enum/i;

const CATEGORY_DEFAULT = {
  微前端: 'P0',
  webpack: 'P0',
  vite: 'P2',
  网络: 'P0',
  node: 'P1',
  vue3: 'P0',
  对比题: 'P1',
  vue: 'P0',
  react: 'P0',
  浏览器: 'P0',
  ts: 'P1',
  handwritten: 'P1',
  agent: 'P1',
  js: 'P1',
  css: 'P2',
  html: 'P3',
  es5: 'P2',
  es6: 'P2',
  compony: 'P2',
};

/**
 * 简历未覆盖 — 面试官通常不会主动问（兰为鹏）
 * CI/CD、Monorepo、NestJS、埋点监控、Vite 深度等
 */
const RESUME_DEMOTE_RE =
  /ci\/cd|cicd|持续集成|持续交付|jenkins|gitlab\s*ci|github\s*actions|Monorepo|monorepo|NestJS|nestjs|埋点|前端监控|监控体系|apm|sentry|神策|growingio|prometheus|grafana|docker|kubernetes|k8s|service\s*mesh|graphql|grpc|flutter|react\s*native|taro原理|knex|sqlserver|java并发|jvm|mysql优化|redis底层|分布式事务|链路追踪|serverless|函数计算|wasm|rust|go语言|tailwind|pnpm\s*workspace|lerna|nx\s*monorepo/i;

/** 简历写了 Vite 对比可以问，但单独 vite 原理非重点 */
const RESUME_VITE_STANDALONE_RE = /interview\/vite\//;

/** 简历核心（猫眼/携程/宏波）— 至少 P1 */
const RESUME_CORE_RE =
  /微前端|qiankun|模块联邦|module federation|为什么不用iframe|webpack|打包|构建|编译|HMR|热更新|首屏|性能|优化|FCP|lighthouse|vue3|vue2|composition|响应式|nexttick|vuex|react|hooks|redux|ssr|typescript|中间件|洋葱|koa|egg|eventloop|事件循环|跨域|缓存|协商|强缓存|http|https|小程序|分包|按需加载|懒加载|代码分割|eslint|灰度|gateway|umi|选座|antd|ant-design|java.*bff|bff|灰度发布|静态资源|网关|webpack升级|并行|串行改并行/i;

const LEVEL_ORDER = ['P0', 'P1', 'P2', 'P3'];

function demote(level, steps = 1) {
  const i = LEVEL_ORDER.indexOf(level);
  return LEVEL_ORDER[Math.min(i + steps, 3)];
}

function boost(level, steps = 1) {
  const i = LEVEL_ORDER.indexOf(level);
  return LEVEL_ORDER[Math.max(i - steps, 0)];
}

function baseClassify(question) {
  const title = question.title || '';
  const category = question.category || '';
  const path = question.path || '';
  const combined = `${title} ${category} ${path}`;

  if (P3_RE.test(combined)) return 'P3';
  if (P0_RE.test(combined)) return 'P0';
  if (P1_RE.test(combined)) return 'P1';

  if (category.startsWith('compony/') || category === 'nowcoder' || path.startsWith('nowcoder/')) {
    if (P0_RE.test(title)) return 'P0';
    if (P1_RE.test(title)) return 'P1';
    return 'P2';
  }

  const topCategory = category.split('/')[0];
  return CATEGORY_DEFAULT[topCategory] || 'P2';
}

function classifyImportance(question) {
  const title = question.title || '';
  const category = question.category || '';
  const path = question.path || '';
  const combined = `${title} ${category} ${path}`;

  if (USER_P0_RE.test(combined)) return 'P0';

  if (RESUME_DEMOTE_RE.test(combined)) return 'P3';

  // Agent 独立题池：原理/LangChain = P1，Python 基础 = P2（简历尚未当核心卖点）
  if (/interview\/agent\/python/.test(path)) return 'P2';
  if (/interview\/agent\//.test(path)) return 'P1';

  let level = baseClassify(question);

  if (RESUME_CORE_RE.test(combined)) {
    if (level === 'P3') level = 'P2';
    if (level === 'P2') level = 'P1';
  }

  // Vite 深度不在简历 → 单独考点最高 P2（对比题除外）
  if (RESUME_VITE_STANDALONE_RE.test(path) && !/vite对比webpack/i.test(combined)) {
    level = LEVEL_ORDER[Math.max(LEVEL_ORDER.indexOf(level), LEVEL_ORDER.indexOf('P2'))];
  }

  return level;
}

function getImportanceWeight(level) {
  return IMPORTANCE_WEIGHT[level] || 1;
}

function getImportanceLabel(level) {
  return IMPORTANCE_LABEL[level] || level;
}

/** 写入 JSON profile 字段 */
const RESUME_PROFILE = {
  name: '兰为鹏',
  yearsOfExperience: 6,
  level: 'senior',
  targetCity: '上海',
  highlights: [
    '微前端 qiankun + Vue3 + TS',
    'Webpack 打包优化 / 构建提速 / 灰度发布',
    'React SSR + Redux（携程地图）',
    '性能优化（首屏 50%+）',
    'Egg/Koa 中间层',
    'H5 / 微信小程序',
    'Umi B端',
  ],
  demoteIfNotOnResume: [
    'CI/CD',
    'Monorepo',
    'NestJS',
    '埋点/监控',
    'Vite 深度（对比题除外）',
  ],
};

module.exports = {
  IMPORTANCE_WEIGHT,
  IMPORTANCE_LABEL,
  RESUME_PROFILE,
  USER_P0_RE,
  classifyImportance,
  getImportanceWeight,
  getImportanceLabel,
};
