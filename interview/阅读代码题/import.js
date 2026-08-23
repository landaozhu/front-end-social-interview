// counter.ts
let num = 1; 

function increase() {
  return num++
}

export { num, increase }

// main.ts
import { num, increase } from './counter' 

console.log(num) 
increase() 
console.log(num)
