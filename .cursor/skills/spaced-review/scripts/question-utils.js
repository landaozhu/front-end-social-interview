/**
 * interview 题目扫描用的标题 / 过滤工具
 */

const ALGO_DS_RE =
  /写一下.*算法|实现.*diff|二叉树|图论|动态规划|快排|十大排序|深度搜索|广度搜索|栈、数组、链表|约瑟夫|击鼓传花|扑克牌.*顺子|找出数组|和为[nm]|并发限制.*调度|compareVersion|实现一个flat|版本号.*比较|x个人抱|自然数|最小距离|两数相加|顺子|大文件上传|断点续传|插入.*二叉树/i;

function stripMarkdown(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`[^`]+`/g, '')
    .replace(/\*\*/g, '')
    .trim();
}

function normalizeTitle(text) {
  return stripMarkdown(text)
    .replace(/^[0-9]+[\.．、]\s*/, '')
    .replace(/^[问Q][:：]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

function isAlgoOrDs(text) {
  return ALGO_DS_RE.test(text);
}

/**
 * 文件名过短或不是问句时，抽题/表格展示用的完整面试问法（key = interview 相对 path）
 */
const INTERVIEW_TITLE_OVERRIDES = {
  'interview/对比题/路由模式区别.md': 'Hash 和 History 路由模式有什么区别？',
  'interview/对比题/vue和react区别.md': 'Vue 和 React 有什么区别？',
  'interview/对比题/useMemo和React.memo.md': 'useMemo 和 React.memo 有什么区别？',
  'interview/对比题/useMemo和useCallback.md': 'useMemo 和 useCallback 有什么区别？',
  'interview/对比题/uniapp小程序和h5兼容.md': 'uniapp 遇到小程序和 H5 兼容问题怎么解决？',
  'interview/网络/常见网络攻击方式.md': '常见网络攻击方式有哪些？怎么防？',
  'interview/ts/type和enum区别.md': 'type 和 enum 有什么区别？',
  'interview/webpack/为什么要有lock.md': '为什么要有 lock 文件？',
  'interview/webpack/package.json的dev和发布模式区别.md': 'package.json 的 dependencies 和 devDependencies 有什么区别？',
  'interview/js/浮点数精度.md': 'decimal / 浮点数精度原理（为什么 0.1+0.2 !== 0.3）',
  'interview/react/ssr请求时机.md': 'SSR 项目请求时机是什么？数据该在哪一层拉？',
  'interview/webpack/灰度发布.md': '灰度环境怎么做的（50% 机制）？',
  'interview/vue/vue2数组响应式.md': 'Vue2 的数组在 Object.defineProperty 之外怎么做响应式？',
  'interview/网络/跨域.md': '什么是跨域？同源策略是什么？常见跨域解决方案有哪些？',
  'interview/微前端/微前端的沙箱隔离机制.md': '微前端的沙箱隔离机制是怎么做的？JS / CSS 分别怎么隔离，哪些要自己收？',
  'interview/微前端/模块联邦.md': '什么是模块联邦？和 qiankun 有什么区别？上单为什么没用它？',
  'interview/对比题/ref对比reactive.md': 'ref 和 reactive 有什么区别？',
  'interview/webpack/从零配置webpack.md': '不用脚手架怎么从零配一份 Webpack？主要考虑哪些方向？',
  'interview/agent/python/装饰器.md': '什么是 Python 装饰器？和 LangChain 的 @tool 有什么关系？',
  'interview/agent/python/生成器与迭代器.md': '生成器和迭代器有什么区别？和 LLM 流式输出有什么关系？',
  'interview/agent/python/async与await.md': 'Python async/await 是干什么的？LangChain 为什么要 ainvoke？',
  'interview/agent/python/类型注解与Pydantic.md': 'Python 类型注解和 Pydantic 在 LangChain 里分别干什么？',
  'interview/agent/python/GIL.md': '什么是 GIL？调 LLM 时它是不是瓶颈？',
  'interview/agent/langchain/LangChain是什么.md': 'LangChain 是什么？和直接调模型 SDK 有什么区别？',
  'interview/agent/langchain/LCEL.md': '什么是 LCEL？Runnable 和 | 管道怎么理解？',
  'interview/agent/langchain/Prompt.md': 'PromptTemplate 和 ChatPromptTemplate 有什么区别？',
  'interview/agent/langchain/Tool.md': 'LangChain 里 Tool 是什么？bind_tools 和 Agent 有什么差别？',
  'interview/agent/langchain/Chain对比Agent.md': 'LangChain 里 Chain 和 Agent 有什么区别？什么时候不该上 Agent？',
  'interview/agent/langchain/Memory.md': 'LLM 为什么需要 Memory？常见几种怎么选？',
  'interview/agent/langchain/RAG链路.md': '用 LangChain 做 RAG 要串哪些组件？',
  'interview/agent/langchain/OutputParser.md': 'OutputParser 是干什么的？为什么不能只靠提示词输出 JSON？',
  'interview/agent/原理/什么是Agent.md': '什么是 Agent？和 Chatbot、固定工作流有什么区别？',
  'interview/agent/原理/ReAct.md': '什么是 ReAct？Thought / Action / Observation 怎么转？',
  'interview/agent/原理/FunctionCalling对比ReAct.md': 'Function Calling 和 ReAct 有什么区别？生产该用哪个？',
  'interview/agent/原理/RAG原理.md': '什么是 RAG？和微调、换大模型比，它解决什么？',
  'interview/agent/原理/幻觉.md': '什么是幻觉？Agent / RAG 场景怎么压？',
  'interview/agent/原理/Temperature与Token.md': 'Temperature 和 Token / 上下文窗口分别影响什么？',
  'interview/agent/原理/Embedding.md': '什么是 Embedding？和 Chat 模型、RAG 检索是什么关系？',
};

function resolveInterviewTitle(relPath, fileTitle) {
  const normalized = relPath.replace(/\\/g, '/');
  return INTERVIEW_TITLE_OVERRIDES[normalized] || fileTitle;
}

function isCodeTitle(text) {
  const t = stripMarkdown(text).trim();
  if (!t) return true;
  if (/^[a-zA-Z_$][\w$.]*\([^)]*\)$/.test(t)) return true;
  if (/^(console\.|return\s|new\s|typeof\s|instanceof\s)/.test(t)) return true;
  const chinese = (t.match(/[\u4e00-\u9fff]/g) || []).length;
  if (chinese === 0 && /[\(\);={}]/.test(t)) return true;
  if (chinese <= 2 && /^[\w\s.(),'"\-$]+$/.test(t) && /[\(\);]/.test(t)) return true;
  return false;
}

module.exports = {
  INTERVIEW_TITLE_OVERRIDES,
  normalizeTitle,
  resolveInterviewTitle,
  isAlgoOrDs,
  isCodeTitle,
};
