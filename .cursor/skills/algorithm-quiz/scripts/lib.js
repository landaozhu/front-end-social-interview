const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const ALGORITHM_DIR = path.join(PROJECT_ROOT, 'interview/algorithm');

const SKIP_FILES = new Set([
  'README.md',
  '高频算法面试题（js）.md',
  '如何分析排序算法.md',
  '十大排序算法.md',
]);

/** 25k 中大厂前端会出现的手写频率（不限一面二面） */
const FREQUENCY_WEIGHT = { high: 0.6, mid: 0.3, low: 0.1 };

const FREQUENCY_BY_FILE = {
  '快排.md': 'high',
  '查找.md': 'high',
  '动态规划.md': 'high',
  '递归.md': 'high',
  '插入排序.md': 'mid',
  '选择排序.md': 'mid',
  '归并排序.md': 'mid',
  '堆排序.md': 'mid',
  '背包问题.md': 'mid',
  '最长公共子串.md': 'mid',
  '希尔排序.md': 'low',
  '桶排序.md': 'low',
  '计数排序.md': 'low',
  '基数排序.md': 'low',
  '贪心算法.md': 'low',
};

const METHOD_BY_FILE = {
  '快排.md': 'sort',
  '查找.md': 'binary-search',
  '动态规划.md': 'dp',
  '递归.md': 'recursion',
  '插入排序.md': 'sort',
  '选择排序.md': 'sort',
  '归并排序.md': 'sort',
  '堆排序.md': 'sort',
  '背包问题.md': 'dp',
  '最长公共子串.md': 'dp',
  '希尔排序.md': 'sort',
  '桶排序.md': 'sort',
  '计数排序.md': 'sort',
  '基数排序.md': 'sort',
  '贪心算法.md': 'greedy',
};

const ASK_BY_FILE = {
  '快排.md': '手写 `quickSort(arr)`，返回升序数组。例：`[5,1,4,2]` → `[1,2,4,5]`。写完再说平均/最坏复杂度和稳不稳定。',
  '查找.md': '手写 `binarySearch(arr, target)`：有序数组找到返回下标，没有返回 -1。例：`[1,3,5,7], 5` → `2`。',
  '动态规划.md': '用 DP 写 `fib(n)` 或 `climbStairs(n)`（不要只写指数递归）。例：`fib(6)` → `8`；`climbStairs(3)` → `3`。',
  '递归.md': '手写递归 `factorial(n)` 或 `fib(n)`，必须有终止条件。例：`factorial(5)` → `120`。',
  '插入排序.md': '手写 `insertionSort(arr)`。例：`[5,4,3,2,1]` → `[1,2,3,4,5]`。',
  '选择排序.md': '手写 `selectionSort(arr)`。例：`[5,4,3,2,1]` → `[1,2,3,4,5]`。',
  '归并排序.md': '手写 `mergeSort(arr)`（拆分 + merge）。例：`[3,1,4,2]` → `[1,2,3,4]`。',
  '堆排序.md': '手写 `heapSort(arr)`：建堆、堆顶与末尾交换、再调整。例：`[4,6,8,5,9]` → `[4,5,6,8,9]`。',
  '背包问题.md': '用 DP 写 0-1 背包 `knapsack(capacity, items)`，items 为 `{size, value}[]`，返回最大价值。例：容量 16，尺寸 `[3,4,7,8,9]` 价值 `[4,5,10,11,13]` → `23`。要有状态和转移，不要只枚举子集。',
  '希尔排序.md': '手写 `shellSort(arr)`。例：`[35,33,42,10,14,19,27,44]` → `[10,14,19,27,33,35,42,44]`。',
  '桶排序.md': '手写 `bucketSort(arr)`。例：`[4,6,8,5,9,1,2]` → `[1,2,4,5,6,8,9]`。',
  '计数排序.md': '手写 `countingSort(arr)`，非负整数。例：`[2,1,2,0,3]` → `[0,1,2,2,3]`。',
  '基数排序.md': '手写 LSD `radixSort(arr)`。例：`[3,44,38,5,15]` → `[3,5,15,38,44]`。',
  '贪心算法.md': '手写部分背包 `fractionalKnapsack(capacity, items)`：按性价比装，装不下按比例。items 为 `{size, value}[]`。',
  '最长公共子串.md': '用动态规划写 `maxSubString(str1, str2)`，返回最长公共子串（连续）。例：`raven` 与 `havoc` → `av`。必须有 DP 状态和转移，暴力多重循环不算过线。',
};

const FRONTEND_BAR_BY_FILE = {
  '快排.md': {
    writeCode: true,
    pass: 'JS 能跑；平均 O(n log n)、最坏 O(n²)、不稳定',
    skip: '三路快排、随机 pivot 证明、尾递归优化',
  },
  '查找.md': {
    writeCode: true,
    pass: '二分 JS 能跑，找到下标或 -1；O(log n)',
    skip: '旋转数组、lower_bound 变形',
  },
  '动态规划.md': {
    writeCode: true,
    pass: '用数组递推写出 fib 或跳台阶，结果对',
    skip: '矩阵快速幂、必须滚动数组',
  },
  '递归.md': {
    writeCode: true,
    pass: '递归 JS 有出口且结果对',
    skip: '尾递归、调用栈实现细节',
  },
  '插入排序.md': {
    writeCode: true,
    pass: '插入排序能跑；最好 O(n)、最坏 O(n²)',
    skip: '必须手写折半插入',
  },
  '选择排序.md': {
    writeCode: true,
    pass: '选择排序能跑；知道 O(n²)',
    skip: '堆选择、双向选择',
  },
  '归并排序.md': {
    writeCode: true,
    pass: '拆+合并能跑；O(n log n)',
    skip: '原地归并、自然归并',
  },
  '堆排序.md': {
    writeCode: true,
    pass: '能跑的堆排（建堆+交换+调整），结果有序',
    skip: '斐波那契堆、heapify 证明',
  },
  '背包问题.md': {
    writeCode: true,
    pass: '有 DP 状态和转移，样例最大价值对',
    skip: '必须一维压缩、完全背包、多重背包、枚举子集',
  },
  '希尔排序.md': {
    writeCode: true,
    pass: '按间隔做插入，结果有序',
    skip: '间隔序列证明',
  },
  '桶排序.md': {
    writeCode: true,
    pass: '能分桶、桶内排序、按序拼回，结果有序',
    skip: '必须手写复杂映射函数',
  },
  '计数排序.md': {
    writeCode: true,
    pass: '用计数数组填回，非负整数结果对',
    skip: '必须前缀和反向填充',
  },
  '基数排序.md': {
    writeCode: true,
    pass: '按位入桶再捞出，样例有序',
    skip: 'MSD 完整实现',
  },
  '贪心算法.md': {
    writeCode: true,
    pass: '按价值密度排序后装包，可拆比例，结果合理',
    skip: '贪心正确性证明',
  },
  '最长公共子串.md': {
    writeCode: true,
    pass: 'DP：dp[i][j] 表示以 str1[i-1]、str2[j-1] 结尾的公共子串长度；相等则 +1 否则 0；记录最长并切出子串。样例对。',
    skip: '暴力三重循环过线、滚动数组必须、最长公共子序列 LCS',
  },
};

const FREQUENCY_LABEL = { high: '高频', mid: '中频', low: '低频' };

function scanAlgorithmQuestions() {
  if (!fs.existsSync(ALGORITHM_DIR)) return [];

  return fs.readdirSync(ALGORITHM_DIR, { withFileTypes: true })
    .filter((f) => f.isFile() && /\.md$/i.test(f.name) && !SKIP_FILES.has(f.name))
    .map((f) => {
      const frequency = FREQUENCY_BY_FILE[f.name] || 'low';
      const title = f.name.replace(/\.md$/i, '');
      const rel = path.posix.join('interview/algorithm', f.name);
      const frontendBar = FRONTEND_BAR_BY_FILE[f.name];
      if (!frontendBar?.writeCode) return null;
      return {
        id: rel,
        title,
        path: rel,
        role: 'frontend',
        difficulty: '25k',
        frequency,
        frequencyLabel: FREQUENCY_LABEL[frequency],
        method: METHOD_BY_FILE[f.name] || 'impl',
        ask: ASK_BY_FILE[f.name] || `手写 JS 实现「${title}」，要能跑。`,
        frontendBar,
        passThreshold: frequency === 'low' ? 5 : 6,
      };
    })
    .filter(Boolean);
}

function pickWeighted(pool) {
  if (pool.length === 0) return null;
  const weights = pool.map((q) => FREQUENCY_WEIGHT[q.frequency] || FREQUENCY_WEIGHT.low);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i += 1) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function pickAlgorithmQuestion(options = {}) {
  const all = scanAlgorithmQuestions();
  let pool = all;
  if (options.frequency && FREQUENCY_WEIGHT[options.frequency]) {
    const filtered = all.filter((q) => q.frequency === options.frequency);
    if (filtered.length > 0) pool = filtered;
  }

  const question = pickWeighted(pool);
  const byFrequency = all.reduce((acc, q) => {
    acc[q.frequency] = (acc[q.frequency] || 0) + 1;
    return acc;
  }, {});

  return {
    session: {
      type: '算法抽查（单题手写）',
      role: '前端',
      round: '25k（不限一面/二面）',
      companyTier: '中大厂（非顶尖）',
      targetSalary: '25k',
      difficulty: '25k：题是什么算法就按什么写，DP 不得改成暴力',
      questionCount: 1,
      pickWeights: FREQUENCY_WEIGHT,
    },
    stats: {
      total: all.length,
      byFrequency,
    },
    question,
    note: '必须写 JS。用 frontendBar.pass 判分。卡住可提示。',
  };
}

module.exports = {
  PROJECT_ROOT,
  FREQUENCY_WEIGHT,
  scanAlgorithmQuestions,
  pickAlgorithmQuestion,
};
