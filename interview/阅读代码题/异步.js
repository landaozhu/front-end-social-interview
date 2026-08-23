main().catch(function() {
  console.log('top', e);
});

async function main() {
  try {
    loadImage();
    loadConfig();
  } catch (e) {
    console.log('main', e);
  }
}

function loadImage(){
  return new Promise((resolve, reject) => {
    setTimeout(reject, 1000, 'network error');
  });
}

async function loadConfig(){
  throw 'logic bug';
  await wait();
  console.log('config ok');
}

function wait(){
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 1000);
  });
}
// //主线程
// main logic bug
// main network error
// //宏任务
// setTimeout(reject, 1000, 'network error');
// //微任务