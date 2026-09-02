function quickSort(arr) {
  quick_sort(arr, 0, arr.length - 1);
  return arr;
}
function quick_sort(arr, start, end) {
  if (start >= end) {
    return;
  }
  let reference = arr[start];
  let p1 = start;
  let p2 = end;
  // 挖坑：p1 从左、p2 从右，把「右小 / 左大」换到对面，直到两指针相遇。
  // 相遇点左边都应 ≤ pivot，右边都应 ≥ pivot。
  while (p1 < p2) {
    // 右边已经 ≥ pivot 的不用动，p2 左移一格找「比 pivot 小、该换到左边」的数。
    // 注意这里是 if 不是 while：本轮最多只挪一格。
    if (p1 < p2 && arr[p2] >= reference) {
      p2--;
    }
    // 左边已经 ≤ pivot 的不用动，p1 右移一格找「比 pivot 大、该换到右边」的数。
    if (p1 < p2 && arr[p1] <= reference) {
      p1++;
    }
    // 两头都停在「放错边」的位置上：左大右小，交换后两边都合法。
    // p1 === p2 时分区结束，不能再换。
    if (p1 < p2) {
      let temp = arr[p1];
      arr[p1] = arr[p2];
      arr[p2] = temp;
    }
  }
  // 分区结束：p1 === p2，这是 pivot 的最终下标。
  // start 当初取出 pivot 后留下一个坑；把相遇点上的数填回坑里，
  // 再把 pivot 放到 p1。此后 p1 左边都 ≤ pivot，右边都 ≥ pivot。
  arr[start] = arr[p1];
  arr[p1] = reference;
  // pivot 已就位，不再参与比较。只递归排左右两段。
  quick_sort(arr, start, p1 - 1);
  quick_sort(arr, p1 + 1, end);
}
console.log(quickSort([2, 5, 7, 2, 5, 1, 93, 4, 6, 10]));
