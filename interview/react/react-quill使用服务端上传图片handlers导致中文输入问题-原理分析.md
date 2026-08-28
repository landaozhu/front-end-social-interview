# react-quill使用服务端上传图片handlers导致中文输入问题-原理分析

> 来源: https://juejin.cn/post/7538137725300572169

## 背景


富文本编辑器：react-quill


当服务端的方法上传图片时，导致输入问题


打字时，导致打一个英文，失焦，而打中文字时，则导致只能打出拼音的第一个字母，中文出不来


解释：用服务端上传图片而不是默认的base64，需要用handlers



## 现象


1.如果有handlers，且onChange里面用了setState或者dispatch，会导致打字有问题


2.如果handlers去掉，打字没问题


3.handers绑定的image函数为空函数，打字还是有问题


4.有handlers，但是没有重新触发渲染（setState、dispatch），打字没问题



## 问题代码


Class写法



```hljs js code-block-extension-codeShowNum
<ReactQuill
        ref={ref => {this.state.myRef = ref}}
        style={{height:'120px'}}
        key='detail'
        theme="snow"
        modules={
          {
            toolbar: {
              container: this.state.container,
              handlers: {
                image: () => this.imageHandler()
              }
            },
            clipboard: {
              // toggle to add extra line breaks when pasting HTML
              matchVisual: false,
            }
          }
        }
        value={this.props.default || ''}
        onChange={this.handleChange}
      />
```


handleChange里面如果用setState或者dispatch（设置store）
Hook写法



```hljs js code-block-extension-codeShowNum
function 业务组件(){
    const imageHandler = () => {
      //服务端上传图片
    }
    return (
        <ReactQuill
            ref={quillRef}
            value={tourBasicObj.detailIntroductionContent || ''}
            placeholder="请输入介绍内容"
            onChange={value => handleDetailIntroductionContentChange(value)}
            style={{ width: 385 }}
            modules={{
                toolbar: {
                  container,
                  handlers: {
                    image: imageHandler,
                  },
                },
              }
            }
          />

    )

}
```



## 初步猜测


是因为重新render导致quill库认为重新绑定hander，进而重新初始化，因此失焦



## 寻找根因



### 源代码结构


1.业务代码使用react-quill


2.react-quill库使用quill，作用是把quill适配成react可以用的库


3.quill才是富文本编辑器的库，富文本编辑功能都在此



### 第一步


排查为什么有了handlers，且onChange里面有了setState，即使handlers挂载空函数，也会导致失焦


根据ai提示与react-quill源码阅读，猜测可能是由于有了handlers，导致modules改变，进而触发某种重载



#### 为什么onChange里面有了setState，就会有问题


这是由于setState会触发render，重新加载组件



#### react-quill源码截图


![](https://juejin.cn/post/7538137725300572169)


![](https://juejin.cn/post/7538137725300572169)


因此尝试调试排查，是因为重新渲染的时候，由于有了handlers，所以导致modules不同吗



#### 本地调试代码模拟如下


父组件


![截屏2025-08-14 14.35.44.png](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/0ca2919eb636453f953515c324ed8a8e~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGD6Iqx5YWw5bKb5Li7:q75.awebp?rk3s=f64ab15b&x-expires=1787812962&x-signature=Ek125iQmVXQACWoVIHFZY8jS%2B3A%3D)


子组件


![截屏2025-08-14 14.36.03.png](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/4db0dee389c8417d939c4bde1cce4f75~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGD6Iqx5YWw5bKb5Li7:q75.awebp?rk3s=f64ab15b&x-expires=1787812962&x-signature=3BwKZySsJOM8F5UnWb%2B1z6SC1gc%3D)


打一个字，触发setState，导致重新渲染(模拟打字场景)


![image.png](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/d0cd6cd46e8747d897e34367c863c64e~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGD6Iqx5YWw5bKb5Li7:q75.awebp?rk3s=f64ab15b&x-expires=1787812962&x-signature=5zaqLuBMH8HkXkWqK8cvC%2FRphjw%3D)

打印结果


![image.png](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/c81f0d1c6c314e05b089c81cc5b9d141~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGD6Iqx5YWw5bKb5Li7:q75.awebp?rk3s=f64ab15b&x-expires=1787812962&x-signature=hJwyxHH3C94zpiEdc8cbar3Z6so%3D)

由此结果证明


有了handlers，会导致modules发生变化



### 第二步


由于有了handlers改变，导致modules发生改变，那么我们需要在源码中寻找答案，由于modules改变，是触发了handers重新挂在或者整个编辑器重新加载


通过在源码里面加console的方法，调试得出结论


由于modules改变，导致触发了unhookEdtior和createEditor，因此导致失焦



#### 调试结果


没有handlers


![image.png](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/78e62cd7d0be4e11859b5e538f41295a~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGD6Iqx5YWw5bKb5Li7:q75.awebp?rk3s=f64ab15b&x-expires=1787812962&x-signature=j1OoT9HGCQSmiQUSaWatzNfS1YU%3D)


有handlers


![image.png](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/2b072330a6e74095bf47ab391a598dbf~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGD6Iqx5YWw5bKb5Li7:q75.awebp?rk3s=f64ab15b&x-expires=1787812962&x-signature=EDraqRKHqXJOoL8WirUke7zmMNU%3D)


对比得出关键代码，有handlers会触发unhookEditor和createEditor



#### 源码中关键代码截图与解释


1.在生命周期钩子componentWillReceiveProps里面会调用shouldComponentRegenerate，会判断是否为true


![image.png](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/9850c85b6e7743118a93b4638d9ce098~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGD6Iqx5YWw5bKb5Li7:q75.awebp?rk3s=f64ab15b&x-expires=1787812962&x-signature=7hFOaAUvaGKmXMZVgbuYRc3vBIU%3D)

2.由于有了handlers，会导致modules不同，因此为true


![image.png](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/be9b4bfccf764efcb357c19f0b103e21~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGD6Iqx5YWw5bKb5Li7:q75.awebp?rk3s=f64ab15b&x-expires=1787812962&x-signature=UEqemr85rqgbz%2Fk1T4jAq5x3%2F00%3D)


![image.png](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/fe2ecc6232d64ba09c99193e95887fc8~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGD6Iqx5YWw5bKb5Li7:q75.awebp?rk3s=f64ab15b&x-expires=1787812962&x-signature=ALikTiabGTNhIZs7AH%2Fj9y%2Fkh34%3D)


3.由于为true，因此调用regenerate方法


![image.png](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/15c435494d1549b4a6b3fac94a5d6a0d~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGD6Iqx5YWw5bKb5Li7:q75.awebp?rk3s=f64ab15b&x-expires=1787812962&x-signature=VPEUsKbqov89r3d7IRHyY8B4iC4%3D)


4.generation方法导致generation状态更新


![image.png](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/be4c989193fc4825984e7407bddba921~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGD6Iqx5YWw5bKb5Li7:q75.awebp?rk3s=f64ab15b&x-expires=1787812962&x-signature=xBhsr1Y1vtxFNbjyx4hi9BANkUg%3D)


5.在生命周期钩子componentWillUpdate会判断，generation是否一致，由于状态已经更新，因此不一致，所以调用componentWillUnmount


![image.png](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/f47592b26e8d40878b4bd3bf5058a850~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGD6Iqx5YWw5bKb5Li7:q75.awebp?rk3s=f64ab15b&x-expires=1787812962&x-signature=bJ6aRutYhoAjMA4tmHB%2BOaWgnJ8%3D)


在componentWillUnmount会触发unhookEdit，导致富文本编辑器失去监听


![image.png](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/cf966f719ce445838343472ecb20f79e~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGD6Iqx5YWw5bKb5Li7:q75.awebp?rk3s=f64ab15b&x-expires=1787812962&x-signature=IJScOexvX0j%2FNX00CrttM39iOKo%3D)


于是有了答案，由于hanlder，导致modules更新，进而触发unhookEditor和createEditor也就是编辑器重载，因此失焦，编辑器渲染之后是不会主动聚焦的，所以也就解释了为什么输入一个中文，就变成拼音且失焦，输了一个英文字母，就失焦



### 第三步


探寻为什么有了handlers，会导致modules更新


通过再次复习react，发现答案


如果是函数式写法，发现只要setState，就会触发render，render的时候就会触发所有方法的重载，如果不想要方法重载，就必须用特殊方法，例如把方法放到函数组件外等


如果是Class写法，由于绑定的函数需要用到this或者this.setState，一般来说必须用bind(this)或者用箭头函数，但是如果用了箭头函数，render的时候，就会导致加载了新的方法



## 结论


根因：由于打字后，onChange里面有setState，触发重新render，导致imageHandler重新定义，最终传给react-quill组件的时候，导致modules发生了变化，最后触发了取消监听editor，再监听editor，进而导致不聚焦（取消监听并重新注册的这个间隙，浏览器会认为编辑区失去了活动状态（尤其是 IME 输入法正在 composition 中时）——这就是失焦发生的地方）



## 解决方案



### Hook函数式写法



#### 1. useMemo


由于useMemo对整个modules做了缓存，保证modules不会发生改变，因此不会触发editor的卸载与重载，进而保持打字正常


![截屏2025-08-14 14.40.30.png](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/842e345a50b04db4bb14ec3f7cfa748c~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGD6Iqx5YWw5bKb5Li7:q75.awebp?rk3s=f64ab15b&x-expires=1787812962&x-signature=kn9T5NPArfloWcewi8gZ7J02eXY%3D)



#### 2.useRef


![截屏2025-08-14 14.40.52.png](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/1e4219ec94144037903331bd51c2182d~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGD6Iqx5YWw5bKb5Li7:q75.awebp?rk3s=f64ab15b&x-expires=1787812962&x-signature=bS6bjM2j9ULBf0Kv3h6I547Ecnc%3D)



#### 3.useCallback


单独对image做useCallback也可以


`imageHandlerCb = useCallback(imageHandler,[]);`


总而言之，是因为handlers导致modules改变，因此只要让handlers不改变或者modules不改变即可



### Class写法


![截屏2025-08-14 14.41.29.png](https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/778fc7e824a84bf0ae453afd3ee83f91~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGD6Iqx5YWw5bKb5Li7:q75.awebp?rk3s=f64ab15b&x-expires=1787812962&x-signature=bs754QGdUIk6wLCW%2FyY6%2FfCP2LU%3D)


由于modules用的是this.modules,而this.modules只会在初始化执行一次，因此不会改变