# react高频面试题

> 来源: https://juejin.cn/post/7290017749715353640

## 常见的 Hooks



## hooks 所对应的组件生命周期


render



```hljs jsx code-block-extension-codeShowNum
useEffect(()=>{
  ...
})
```


componentDidMount



```hljs jsx code-block-extension-codeShowNum
useEffect(()=>{
  ...
},[])
```


componentDidUpdate



```hljs jsx code-block-extension-codeShowNum
useEffect(()=>{
  ...
},[xx])
```


componentWillUnMount



```hljs jsx code-block-extension-codeShowNum
useEffect(()=>{
  return ()=>{
    ...
  }
},[])
```



## 组件之间通讯



### props和callback



#### 父传子



```hljs jsx code-block-extension-codeShowNum
function Father(){
  const [count, setCount] = useState();
  return (<Child count={count}/>)
}
function Child(props){
  return (<div>{props.count}</div>)
}
```



#### 子传父



```hljs jsx code-block-extension-codeShowNum
function Father(){
  function getCount(count){
    console.log(count)
  }
  return (<Child getCount={getCount}/>)
}
function Child(props){
   const [count, setCount] = useState();
  return (<div onClick={()=>props.getCount(count)}>'getCount'</div>)
}
```



#### 兄弟


子1传父、父传子2



### Context


特定场景使用：路由、主题、全局的共享信息



### ref



### 状态管理库



#### redux




- 使用单一store作为数据源

- store只读，唯一改变store是action

- 使用纯函数来修改，接受之前的store和action，返回新的store



缺点


- 学习曲线陡峭，副作用交给中间件处理，社区中间件很多，导致得学中间件

- 大量的模版代码，action、store，跟逻辑无关

- 性能问题，state更新会影响所有的组件，action会调用所有的reducer




#### mobx


mobx三个概念




- state

- actions

- derivations（派生）
derivations分为Computed Values（计算值）和Reactions（副作用）




## setState 同步、异步、是否合并（读代码



## React18 有什么变化



### 升级


npm i react@18 react-dom@18


原来



```hljs jsx code-block-extension-codeShowNum
import {render} from 'react-dom';
const rootElement = document.getElementById('root')
render(<App/>,rootElement)
```


现在



```hljs jsx code-block-extension-codeShowNum
import {createRoot} from 'react-dom/client';
const rootElement = document.getElementById('root')
const root=createRoot(rootElement)
root.render(<App/>,rootElement)
```


18的升级是渐进式升级，很多新功能是可选的，并不会因为升级对以前的代码带来破坏性的影响



### 放弃兼容ie


17能兼容ie11，18不兼容，如果要兼容，只能回退react版本。



### automatic Batching自动批处理



```hljs jsx code-block-extension-codeShowNum
const [count, setCount]=useState(0);
const [name, setName]=useState('');
setTimeout(()=>{
  setCount(1);
  setName('lwp');
})
```


18之前：异步里面不会自动批处理，会触发两次set
18之后会触发一次set
如果不想使用automatic Batching



```hljs jsx code-block-extension-codeShowNum
import {flushSync} from 'react-dom'
flushSync(()=>{
  setCount(1);
  setCount(2);
})
```


不想用automatic batching场景




- 你需要在状态之后，立刻读取dom上的数据



在17之前，class组件的异步代码里面的setState是同步，而18之后所有的场景下都是异步的，如果想要变成同步，依然用flushSync



```hljs jsx code-block-extension-codeShowNum
class Counter{
  constructor(){
    this.state={
      count:0
    }
  }
  fn=()=>{
    setTimeout(()=>{
      this.setState({count:count+1})
      //React 17:1
      //React 18:0
      console.log(count)
  })
  }
}
```



```hljs jsx code-block-extension-codeShowNum
setTimeout(()=>{
    flushSync(()=>{
        this.setState({count:count+1})
        //React 17:1
        //React 18:0
        console.log(count)
    })
  })
```



### 返回值


原来组件只能返回null，现在既可以返回null也可以返回undefined



### concurrent并发渲染


原来渲染只能一个一个触发（串行），且不可中断
现在




- 渲染可暂停、可继续、可终止

- 渲染可以在后台进行

- 渲染可以有优先级




### transitions


渲染优先级里面分为高优先级和低优先级，默认高优先级，通过transitions来标记低优先级
class



```hljs jsx code-block-extension-codeShowNum
import {startTransitions} from 'react'
startTransitions(()=>{
  xxx
})
```


hook



```hljs jsx code-block-extension-codeShowNum
import {useTransitions} from 'react'
const [pending, startTransitions] = useTransitions()
startTransitions(()=>{
  xxx
})
```



### Suspense


以前我们进行异步请求都是fetch then render



```hljs jsx code-block-extension-codeShowNum
function Father(){
  const [title,setTitle]=useState();
  useEffect(()=>{
    getTitle().then(res=>{
      setTitle(res)
    })
  },[])
  return (<div>
    {!title?<Loading/>:title}
    <Child/>
  </div>)
}
function Child(){
    const [list,setList]=useState();
  useEffect(()=>{
    getList().then(res=>{
      setList(res)
    })
  },[])
  return (<div>
    {!list&&<Loading/>}
    {list&&list.map(item=>(<div>{item}</div>))}
  </div>)
}
```


这样就会导致两个组件的请求是串行，增加渲染时间
为了改变这种方式，可以通过Promise.all改造成并行，但是这种方式依然有缺点，就是两次请求必须都完成才能进行渲染。于是有了Suspense。fetch as you render



```hljs jsx code-block-extension-codeShowNum
function Father(){
  const [title,setTitle]=useState();
  useEffect(()=>{
    getTitle().then(res=>{
      setTitle(res)
    })
  },[])
  return (<Suspense fallback=(<Loading/>)>
    
    <Suspense fallback=(<Loading/>)><Child/></Suspense>
  </Suspense>)
}
function Child(){
    const [list,setList]=useState();
  useEffect(()=>{
    getList().then(res=>{
      setList(res)
    })
  },[])
  return (<div>
    {list.map(item=>(<div>{item}</div>))}
  </div>)
}
```



```hljs jsx code-block-extension-codeShowNum
//并行
<Suspense1></Suspense1>
<Suspense2></Suspense2>
//串行
<Suspense1><Suspense2></Suspense2></Suspense1>
```



## React18 的 useEffect 开发环境下会执行两次（了解）



## React 事件和 DOM 事件的区别



## state 不可变数据，immer.js



## 性能优化，useMemo，useCallback，React.memo



## 原理：batchUpdate ，fiber ，concurrent 机制 （低优）