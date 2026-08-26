app.use(async (ctx, next) => {
  console.log('A before')

  await next()

  console.log('A after')
})

app.use(async (ctx, next) => {
  console.log('B before')

  await next()

  console.log('B after')
})

app.use(async (ctx, next) => {
  console.log('C')
})

输出：

A before
B before
C
B after
A after