// counter.js 
let num = 1; 

function increase() {
  return num++; 
}

module.exports = { num, increase } 

// main.js 
const { num, increase } = require('./counter.js') 

console.log(num) //1
increase() 
console.log(num)//1

------
// a.js
exports.name = 'Tom'

setTimeout(() => {
  exports.name = 'Jerry'
}, 1000)

//b.js
const a = require('./a')

console.log(a.name)

setTimeout(() => {
  console.log(a.name)
}, 2000)

Tom
Jerry
