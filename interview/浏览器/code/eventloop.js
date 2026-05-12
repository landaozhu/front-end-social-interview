async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  console.log("async2");
}
console.log("js start");
setTimeout(function () {
  console.log("timeout");
}, 0);
async1();
new Promise(function (resolve) {
  console.log("promise");
  resolve();
}).then(function () {
  console.log("then");
});
console.log("js end");

//js start
//async1 start
//async2
//promise
//js end
//"async1 end
//then
//timeout