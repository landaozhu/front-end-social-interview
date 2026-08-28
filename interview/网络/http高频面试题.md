# http高频面试题

> 来源: https://juejin.cn/post/7277830857422897164

## 三次握手


![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/2/22/1706c89b92f7503f~tplv-t2oaga2asx-jj-mark:3024:0:0:0:q75.awebp)




- 第一次握手：客户端将报文标志位SYN置为1，随机产生一个序号值seq=J，保存在TCP首部的序列号字段里，**指明客户端打算连接的服务器端口，并将该数据包发送给服务端**，发送完毕后，客户端进入SYN_SENT状态，等待服务器确认。

- 第二次握手：**服务端收到数据包**后由标志位SYN=1**知道客户端请求连接**，服务端嫁给你TCP报文标志位和ACK都置为1，ack=J+1，随机产生一个序列号值seq=K，并将该数据包发送给**客户端确认连接请求**，服务器进入SYN_RCVD状态

- 第三次握手：**客户端收到确认后**，检查ack是否为J+1，ACK是否为1，如果正确则**连接建立成功**，客户端和服务端进入ESTABLISHED状态，完成三次握手，随后客户端与服务器端之间**可以开始传输数据**了。




### 通俗的话描述




- 第一次客户端把数据包发给服务端，等待服务端确认

- 第二次服务端收到客户端数据包，得知它要请求连接，于是告诉客户端同意请求连接，进入等待状态

- 第三次客户端收到服务端的确认，知道服务端已经同意建立连接，于是连接建立成功，开始传输数据。




### 为什么需要三次握手


假设客户端发送第一个连接请求报文并没有丢失，由于长时间延误，导致很长时间才达到服务端，但服务却发出确认，同意连接，连接就建立，但是客户端不知道，并不会发送数据，这样服务端资源就白白浪费了。

![截屏2023-09-12 上午11.57.16.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f8290cc8d9ef4bf1b88b9a5accb2e50a~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp#?w=628&h=218&s=97608&e=png&b=efefef)



## 14种常见状态码


100正在处理
200成功
204无内容
206部分内容
301永久重定向
302临时重定向
303查看其他地址
304资源未修改
307临时重定向
400客户端错误
401认证失败
403禁止访问
404资源未找到
500服务器错误
503停机
504网关超时



## 状态码解释



### 100


应用:post大数据传输



### 204（No Content）


表示请求成功，但响应的报文不包含实体的主体部分，也不允许返回任何实体的主体。
一般用于只需要客户端发送信息到服务端，而服务端不需要返回信息给客户端



### 206（Partial Content）


客户端对服务端进行部分请求，而服务端只执行了这部分的get请求。响应报文中包含着Content-Range指定范围的实体内容。
应用:断点续传，或视频、大文件加载



### 301


永久性重定向
应用:新域替换旧域，旧域不再使用



### 302


临时性重定向
应用：让未登录的页面重定向到登陆页、短网址



### 303（See Other）


虽然地址也变了，但和301、302不一样，303指明用get进行请求。



### 304


应用:协商缓存



### 307（Temporary Redirect）


临时重定向，和302不同的是，302不遵守从post变成get的规则，但307会遵守。



### 400


客户端错误
应用:参数错误



### 401


认证失败 重新登陆



### 403


禁止访问
应用：外网访问不了，内网才能返回



### 404（No Found）


服务器找不到资源或者不想说明拒绝请求的理由



### 500（International Server Error）


服务器内部错误
可能是有bug或者是临时故障



### 503（Server Unarable）


服务超负载或者停机维护，现在无法处理请求



## 跨域


为什么会跨域：因为浏览器有同源策略，不同源就会导致跨域
什么叫同源策略：协议、域名、端口号一致则同源
跨域会限制哪些方面：ajax、cookie、localStorage、indexDB，DOM，JS



### 解决跨域



#### JSONP（以前常用）


由于script的请求并不会导致跨域，于是让script作为一个代理，让script去请求
原生js实现



```hljs js code-block-extension-codeShowNum
var script = document.createElement('script');
script.src = 'http://baidu.com&callback=handleCallback'
document.head.appendChild(script);
function handleCallback(res){

}
```


jQuery ajax实现



```hljs js code-block-extension-codeShowNum
$.ajax({
  url:'',
  dataType:'jsonp',
  jsonpCallback:"handleCallback"
})
```


axios实现



```hljs js code-block-extension-codeShowNum
axios.jsonp('',{
  jsonp:'handleCallback'
})
```


缺点：只能发送get



#### CORS（常用）


'Access-Control-Allow-Origin': '*'



#### img


由于mg的请求并不会导致跨域，于是让mg作为一个代理，让mg去请求



#### nginx反向代理



#### nodejs中间件代理



## 强缓存和协商缓存


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c3443af285d240a7a854a3252c0315be~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp#?w=720&h=633&s=15358&e=webp&b=fdfcfc)



### 强缓存


如果服务端觉得浏览器请求的资源应该被缓存下来，比如图片，css不经常改的资源，就会在http响应里添加一个响应头Catche-Control：max-age=1200（s），会让浏览器自动下载缓存到本地。
下一次请求资源时，先看看有没有过期，没过期直接用该资源，不发送请求。且返回Status Code：200，但是会添加上from memory cache或者from disk memory，这个由浏览器自己来判断，一般大文件放硬盘，小文件放内存。
如果过期，就会进行服务请求，如果在服务中没有采取协商缓存，就会返回最新资源+200+Catche-Control。



#### 注意




- 每次Catche-Control服务端自己决定加不加过期时间，加了就能强制缓存。Catch-Control：no-Store表示不加过期时间

- from memory cache：内存

- from disk cache：硬盘

- Catche-Control：max-age缓存时间；no-cathe：不用缓存，去请求服务端；no-store：不用本地缓存，也不用服务端缓存




### 协商缓存


当缓存过期（Catch-Control）的时候，会请求服务端，根据Etag（请求头If-None-Match）判断资源是否为最新。如果是最新，直接返回304，表示资源未被加载，如果不是最新，且没有Last-Modifined，就会返回200+最新资源+最新Etag字符串
如果有Last-Modified（请求头If-Modified-Since），服务端就会检查修改时间是否一致，如果一致，返回304，告诉浏览器资源未修改，否则返回200+最新资源+最新资源修改时间



#### Etag


资源对应的唯一标识，是这个服务端生成的一个hash值，返回给浏览器，浏览器请求的时候带上请求键名，If-None-Match,值为Etag字符串，当再次请求到服务的时候，服务端会对浏览器的Etag字符串和服务端端Etag字符串进行对比。



#### Last-Modified


最新资源修改时间，浏览器第一次访问服务端时，服务端会返回资源和修改时间标识Last-Modified，浏览器再次请求时，请求头带上If-Modified-Since，那么服务端就会查看着两者是否一致



#### 注意


Etag和Last-Modified可以都有，也可以只有一个，如果两者都存在，建议先判断Etag。比如说修改了一个文件，改完又改回去，修改时间Last-Modifed变了，但文件没变化。那这个时候Etag是不变的，所以Etag会更准确。



## https加密过程



### http的缺点




- 通信使用明文，可能会被窃听

- 通信时不会验证双方的身份，可能遭遇伪装

- 无法验证报文的完整性，可能遭遇篡改。




### https


https=http+加密+认证+完整性保护



### 加密技术




- 对称加密：加密和解密同为一个密码，且加解密速度快，典型的对称加密算法有DES、AES

- 非对称加密：密钥成对出现，公钥加密需要私钥解密，私钥加密需要公钥解密。加解密速度慢。




### HTTPS的加密方式


采用混合加密（对称和非对称）
非对称虽然安全，但慢，所以采用两者结合。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/91aae7f63ddd40a787f4c8cb1fd386f2~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp)

首先在服务端，有一对非对称的密钥，一个公钥，一个私钥，把公钥传给客户端，客户端生成一个密钥key，用公钥把密钥加密成二次加密的密钥，返回给服务端，服务端拿到二次加密的密钥，通过私钥解密成密钥key，那么此时客户端和服务端都拿到一个对称的密钥key，加下来之后的传输，就用这把对称的密钥key去进行加密和解密。
为什么这种方法不会有问题，原因是对称加密之所以会不安全，是因为密钥会在过程中传输，暴露在外，所以会被劫持，而这种混合方法暴露在外的是已经通过非对称加密过的密钥，所以被劫持也没有用。通过这种方法，两边都得到一把对称密钥，且不会在外暴露，那么之后的一个数据传输就用这个对称加密来加解密就可以了，这样速度也很快。



### CA证书


因为公钥在传输有可能被替换，不是真正服务器发出来的公钥，所以需要证书认证



### https通信过程


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/50ef377497444f3da6c3a4f2d92a8fd4~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp)

大致分为三个过程：证书校验、建立连接、数据传输
1）客户端发送请求给服务端
2）服务端保存有CA证书，这个证书包含非对称加密的公钥以及其他公司信息
3）服务端响应请求，把证书给客户端
4）客户端拿到证书，进行解析，验证合法性，得到公钥，并且生成一个随机码，key，也就是对称加密的key，用公钥对其加密，得到二次加密的密钥
5）客户端把加密的密钥传给服务端
6）服务端用私钥对其解密，得到对称的密钥。此时客户端和服务端同时拿到对称加解密的密钥。建立连接。
7）客户端用对称的密钥加密，传给服务端，服务端拿到对称加密的密钥，解密。
8）双方愉快的传递消息。



### 总结


http和https的区别




- http明文传输，https加密传输，安全性较好

- https需要申请证书，需要一定费用

- http响应速度快，因为加密需要时间

- https是构建在SSL/TLS之上的http协议，所以更消耗服务器资源

- http端口80，https端口443