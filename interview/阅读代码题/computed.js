const count = ref(0)
const double = computed(() => {
  console.log('我这里执行了几次')
  return count.value * 2
})

count.value = 1
console.log(double.value) // 手动读取

count.value = 2
count.value = 3
console.log(double.value) // 手动读取
