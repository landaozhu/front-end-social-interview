# react15.6.2-从源码了解核心流程

> 来源: https://juejin.cn/post/7649642814955847732

.markdown-body{word-break:break-word;line-height:1.75;font-weight:400;font-size:16px;overflow-x:hidden;color:#252933}.markdown-body h1,.markdown-body h2,.markdown-body h3,.markdown-body h4,.markdown-body h5,.markdown-body h6{line-height:1.5;margin-top:35px;margin-bottom:10px;padding-bottom:5px}.markdown-body h1{font-size:24px;line-height:38px;margin-bottom:5px}.markdown-body h2{font-size:22px;line-height:34px;padding-bottom:12px;border-bottom:1px solid #ececec}.markdown-body h3{font-size:20px;line-height:28px}.markdown-body h4{font-size:18px;line-height:26px}.markdown-body h5{font-size:17px;line-height:24px}.markdown-body h6{font-size:16px;line-height:24px}.markdown-body p{line-height:inherit;margin-top:22px;margin-bottom:22px}.markdown-body img{max-width:100%}.markdown-body hr{border:none;border-top:1px solid #ddd;margin-top:32px;margin-bottom:32px}.markdown-body code{word-break:break-word;border-radius:2px;overflow-x:auto;background-color:#fff5f5;color:#ff502c;font-size:.87em;padding:.065em .4em}.markdown-body code,.markdown-body pre{font-family:Menlo,Monaco,Consolas,Courier New,monospace}.markdown-body pre{overflow:auto;position:relative;line-height:1.75}.markdown-body pre>code{font-size:12px;padding:15px 12px;margin:0;word-break:normal;display:block;overflow-x:auto;color:#333;background:#f8f8f8}.markdown-body a{text-decoration:none;color:#0269c8;border-bottom:1px solid #d1e9ff}.markdown-body a:active,.markdown-body a:hover{color:#275b8c}.markdown-body table{display:inline-block!important;font-size:12px;width:auto;max-width:100%;overflow:auto;border:1px solid #f6f6f6}.markdown-body thead{background:#f6f6f6;color:#000;text-align:left}.markdown-body tr:nth-child(2n){background-color:#fcfcfc}.markdown-body td,.markdown-body th{padding:12px 7px;line-height:24px}.markdown-body td{min-width:120px}.markdown-body blockquote{color:#666;padding:1px 23px;margin:22px 0;border-left:4px solid #cbcbcb;background-color:#f8f8f8}.markdown-body blockquote:after{display:block;content:""}.markdown-body blockquote>p{margin:10px 0}.markdown-body ol,.markdown-body ul{padding-left:28px}.markdown-body ol li,.markdown-body ul li{margin-bottom:0;list-style:inherit}.markdown-body ol li .task-list-item,.markdown-body ul li .task-list-item{list-style:none}.markdown-body ol li .task-list-item ol,.markdown-body ol li .task-list-item ul,.markdown-body ul li .task-list-item ol,.markdown-body ul li .task-list-item ul{margin-top:0}.markdown-body ol ol,.markdown-body ol ul,.markdown-body ul ol,.markdown-body ul ul{margin-top:3px}.markdown-body ol li{padding-left:6px}.markdown-body .contains-task-list{padding-left:0}.markdown-body .task-list-item{list-style:none}@media (max-width:720px){.markdown-body h1{font-size:24px}.markdown-body h2{font-size:20px}.markdown-body h3{font-size:18px}}.markdown-body pre,.markdown-body pre>code.hljs{color:#333;background:#f8f8f8}.hljs-comment,.hljs-quote{color:#998;font-style:italic}.hljs-keyword,.hljs-selector-tag,.hljs-subst{color:#333;font-weight:700}.hljs-literal,.hljs-number,.hljs-tag .hljs-attr,.hljs-template-variable,.hljs-variable{color:teal}.hljs-doctag,.hljs-string{color:#d14}.hljs-section,.hljs-selector-id,.hljs-title{color:#900;font-weight:700}.hljs-subst{font-weight:400}.hljs-class .hljs-title,.hljs-type{color:#458;font-weight:700}.hljs-attribute,.hljs-name,.hljs-tag{color:navy;font-weight:400}.hljs-link,.hljs-regexp{color:#009926}.hljs-bullet,.hljs-symbol{color:#990073}.hljs-built_in,.hljs-builtin-name{color:#0086b3}.hljs-meta{color:#999;font-weight:700}.hljs-deletion{background:#fdd}.hljs-addition{background:#dfd}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:700}
从源码角度，带大家了解，从业务代码开始，是怎样一步一步往底层走的，过程会比较繁琐，本文会忽略具体细节，只保留核心代码



阅读源码前，如果下面内容不熟悉，可以先复习一下，避免造成源码阅读困难




- 对象: assign等相关API

- 函数: 本质是一个对象，es5如何模拟es6的静态属性、函数，es5如何模拟类

- 原型

- this

- class类：本质是语法糖



可以参考《Javascript高级程序设计》第五版第四章+《Javascript设计模式》第三章，保证不白读



## 业务代码



```
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      count: 0
    };
  }

  componentWillMount() {
    console.log('componentWillMount');
  }

  componentDidMount() {
    console.log('componentDidMount');
  }

  handleClick = () => {
    this.setState({
      count: this.state.count + 1
    });
  };

  render() {
    return (
      <div>
        <h1>Hello React 15.6.2</h1>
        <p>{this.state.count}</p>
        <button onClick={this.handleClick}>+1</button>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
```



## 初始化渲染



### 入口


想知道怎么从零开始找入口文件的可以自行看构建文件，这里先直接给出具体路径




- React: src/isomorphic/React.js

- ReactDOM: src/renderers/dom/ReactDOM.js



React模块化是自己实现的，因此没有相对或者绝对地址这种概念，不知道怎么确定具体文件是哪个，可以搜`@providesModule xx`，例如`require('ReactDOM')`，可以搜：`@providesModule ReactDOM`


由于用到了JSX，因此源码在接收业务代码调用的时候，会先通过babel编译，因此实际上的代码为



```
const App = React.createElement('App', null)
ReactDOM.render(
  App,
  document.getElementById('root')
);
```



### React.createElement


文件映射



```
ReactElement: src/isomorphic/classic/element/ReactElement.js
```




- React.js




```
var React = {
    Component: ReactBaseClasses.Component,
    PureComponent: ReactBaseClasses.PureComponent,
    createElement: ReactElement.createElement
}
```


2.ReactElement



```
var ReactElement = function(){
    return element
}
ReactElement.createElement = function(){
    return ReactElement()
}
```



### ReactDom.render


文件映射



```
ReactMount: src/renderers/dom/client/ReactMount.js
ReactUpdates: src/renderers/shared/stack/reconciler/ReactUpdates.js
instantiateReactComponent: src/renderers/shared/stack/reconciler/instantiateReactComponent.js
```




- ReactDom




```
ReactDefaultInjection.inject();//依赖注入，后面阅读ReactUpdates有用
var ReactDOM = {
    render: ReactMount.render,
}
```




- ReactMount



内部顺序：
ReactMount.render -> ReactMount._renderSubtreeIntoContainer -> ReactMount._renderNewRootComponent -> ReactUpdates.batchedUpdates



```
var ReactMount = {
  TopLevelWrapper,
  render: function(nextElement, container, callback) {
    return ReactMount._renderSubtreeIntoContainer(
      null,
      nextElement,
      container,
      callback,
    );
  },
  _renderSubtreeIntoContainer: function(
    parentComponent,
    nextElement,
    container,
    callback,
  ) {
    var nextWrappedElement = React.createElement(TopLevelWrapper, {
      child: nextElement,
    });
    var component = ReactMount._renderNewRootComponent(
      nextWrappedElement,//<App/>
      container,//document.getElementById('root')
      shouldReuseMarkup,
      nextContext,
    )._renderedComponent.getPublicInstance();

    return component;
  },
  _renderNewRootComponent: function(
    nextElement,
    container,
    shouldReuseMarkup,
    context,
  ) {
    var componentInstance = instantiateReactComponent(nextElement, false);

    // The initial render is synchronous but any updates that happen during
    // rendering, in componentWillMount or componentDidMount, will be batched
    // according to the current batching strategy.

    ReactUpdates.batchedUpdates(
      batchedMountComponentIntoNode,
      componentInstance,
      container,
      shouldReuseMarkup,
      context,
    );

    return componentInstance;
  },
}
```


ReactUpdates.batchedUpdates是做了一个开启批量更新环境，注释也说了，如果componentWillMount或者componentDidMount内部出现重新setState，会进入批量处理




- ReactUpdates




```
var batchingStrategy = null;
function batchedUpdates(callback, a, b, c, d, e) {
  ensureInjected();
  return batchingStrategy.batchedUpdates(callback, a, b, c, d, e);
}

var ReactUpdatesInjection = {
  injectBatchingStrategy: function(_batchingStrategy) {
    batchingStrategy = _batchingStrategy;
}
var ReactUpdates = {
  batchedUpdates: batchedUpdates,
}
```


阅读上面代码会发现有ReactUpdatesInjection.injectBatchingStrategy，只有调用ReactUpdatesInjection.injectBatchingStrategy，才有：batchingStrategy.batchedUpdates，之前我在ReacDom有写到依赖注入`ReactDefaultInjection.inject()`


ReactDefaultInjection



```
function inject(){
  ReactInjection.Updates.injectBatchingStrategy(ReactDefaultBatchingStrategy);
}
```


ReactInjection



```
var ReactInjection = {
  Updates: ReactUpdates.injection,
};
```


ReactDefaultBatchingStrategy



```
function ReactDefaultBatchingStrategyTransaction() {
  this.reinitializeTransaction();
}
Object.assign(ReactDefaultBatchingStrategyTransaction.prototype, Transaction, {
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },
});
var transaction = new ReactDefaultBatchingStrategyTransaction();
var ReactDefaultBatchingStrategy = {
  isBatchingUpdates: false,

  /**
   * Call the provided function in a context within which calls to `setState`
   * and friends are batched such that components aren't updated unnecessarily.
   */
  batchedUpdates: function(callback, a, b, c, d, e) {
    var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;

    ReactDefaultBatchingStrategy.isBatchingUpdates = true;

    // The code is written this way to avoid extra allocations
    if (alreadyBatchingUpdates) {
      return callback(a, b, c, d, e);
    } else {
      return transaction.perform(callback, null, a, b, c, d, e);
    }
  },
};
```


开启批量更新，执行：transaction.perform(callback, null, a, b, c, d, e);
Transaction



```
var TransactionImpl = {
    perform: function(method,scope,a,b,c,d,e,f){
        try{
            ret = method.call(scope, a, b, c, d, e, f);
        }finnally{
            this.closeAll(0);
        }
    }
}
module.exports = TransactionImpl;
```


method.call(scope, a, b, c, d, e, f);也就是



```
batchedMountComponentIntoNode.call(  
null,  
componentInstance,  
container,  
shouldReuseMarkup,  
context,  
undefined  
)
```


4.继续回到ReactMount


流程概述：batchedMountComponentIntoNode -> mountComponentIntoNode ->



```
function mountComponentIntoNode(
  wrapperInstance,
  container,
  transaction,
  shouldReuseMarkup,
  context,
) {
  var markup = ReactReconciler.mountComponent(
    wrapperInstance,
    transaction,
    null,
    ReactDOMContainerInfo(wrapperInstance, container),
    context,
    0 /* parentDebugID */,
  );
  ReactMount._mountImageIntoNode(
    markup,
    container,
    wrapperInstance,
    shouldReuseMarkup,
    transaction,
  );
}
function batchedMountComponentIntoNode(
  componentInstance,
  container,
  shouldReuseMarkup,
  context,
) {
  var transaction = ReactUpdates.ReactReconcileTransaction.getPooled(
    /* useCreateElement */
    !shouldReuseMarkup && ReactDOMFeatureFlags.useCreateElement,
  );
  transaction.perform(
    mountComponentIntoNode,
    null,
    componentInstance,
    container,
    transaction,
    shouldReuseMarkup,
    context,
  );
  ReactUpdates.ReactReconcileTransaction.release(transaction);
}
```


ReactMount._mountImageIntoNode是把markup插入到#root，因此看ReactReconciler.mountComponent


看ReactReconciler



```
var ReactReconciler = {
  mountComponent: function(
    internalInstance,
    transaction,
    hostParent,
    hostContainerInfo,
    context,
    parentDebugID, // 0 in production and for roots
  ) {
      var markup = internalInstance.mountComponent(
      transaction,
      hostParent,
      hostContainerInfo,
      context,
      parentDebugID,
    );
    return markup;
  }
}
```


这里的internalInstance从ReactMount来的
ReactMount



```
var componentInstance = instantiateReactComponent(nextElement, false);
```




- instantiateReactComponent




```
var ReactCompositeComponentWrapper = function(element) {
  this.construct(element);
};
function instantiateReactComponent(node, shouldHaveDebugID) {
    var instance = new ReactCompositeComponentWrapper(element);
    return instance
}

Object.assign(
  ReactCompositeComponentWrapper.prototype,
  ReactCompositeComponent,
  {
    _instantiateReactComponent: instantiateReactComponent,
  },
);
```


而internalInstance.mountComponent，mountComponent会从ReactCompositeComponentWrapper的原型找，也就是ReactCompositeComponent




- ReactCompositeComponent




```
function shouldConstruct(Component) {
  return !!(Component.prototype && Component.prototype.isReactComponent);
}
var ReactCompositeComponent = {
  mountComponent: function(
    transaction,
    hostParent,
    hostContainerInfo,
    context,
  ) {
    var updateQueue = transaction.getUpdateQueue();
    
    // Initialize the public class
    var doConstruct = shouldConstruct(Component);
    var inst = this._constructComponent(
      doConstruct,
      publicProps,
      publicContext,
      updateQueue,
    );
    var renderedElement;

    // Support functional components
    if (!doConstruct && (inst == null || inst.render == null)) {
      renderedElement = inst;
      warnIfInvalidElement(Component, renderedElement);
      inst = new StatelessComponent(Component);//对函数进行包装，抹平class写法和函数写法
      this._compositeType = CompositeTypes.StatelessFunctional;
    } else {
      if (isPureComponent(Component)) {
        this._compositeType = CompositeTypes.PureClass;
      } else {
        this._compositeType = CompositeTypes.ImpureClass;
      }
    }



    // These should be set up in the constructor, but as a convenience for
    // simpler class abstractions, we set them up after the fact.
    inst.props = publicProps;
    inst.context = publicContext;
    inst.refs = emptyObject;
    inst.updater = updateQueue;

    this._instance = inst;

    // Store a reference from the instance back to the internal representation
    ReactInstanceMap.set(inst, this);

   


    var initialState = inst.state;
    if (initialState === undefined) {
      inst.state = initialState = null;
    }


    this._pendingStateQueue = null;
    this._pendingReplaceState = false;
    this._pendingForceUpdate = false;

    var markup = this.performInitialMount(
        renderedElement,
        hostParent,
        hostContainerInfo,
        transaction,
        context,
      );

    if (inst.componentDidMount) {
        transaction.getReactMountReady().enqueue(inst.componentDidMount, inst);
    }

    return markup;
  },
  _constructComponent: function(
    doConstruct,
    publicProps,
    publicContext,
    updateQueue,
  ) {
      return this._constructComponentWithoutOwner(
        doConstruct,
        publicProps,
        publicContext,
        updateQueue,
      );
  },
  _constructComponentWithoutOwner: function(
    doConstruct,
    publicProps,
    publicContext,
    updateQueue,
  ) {
    var Component = this._currentElement.type;

    if (doConstruct) {//class写法
      return new Component(publicProps, publicContext, updateQueue);//返回new App()
    }

    return Component(publicProps, publicContext, updateQueue);//返回函数执行App()
  },
  performInitialMount: function(
    renderedElement,
    hostParent,
    hostContainerInfo,
    transaction,
    context,
  ) {
    var inst = this._instance;

    var debugID = 0;


    if (inst.componentWillMount) {
      inst.componentWillMount();
      // When mounting, calls to `setState` by `componentWillMount` will set
      // `this._pendingStateQueue` without triggering a re-render.
      if (this._pendingStateQueue) {
        inst.state = this._processPendingState(inst.props, inst.context);
      }
    }

    // If not a stateless component, we now render
    if (renderedElement === undefined) {
      renderedElement = this._renderValidatedComponent();
    }

    var nodeType = ReactNodeTypes.getType(renderedElement);
    this._renderedNodeType = nodeType;
    var child = this._instantiateReactComponent(
      renderedElement,
      nodeType !== ReactNodeTypes.EMPTY /* shouldHaveDebugID */,
    );
    this._renderedComponent = child;

    var markup = ReactReconciler.mountComponent(
      child,
      transaction,
      hostParent,
      hostContainerInfo,
      this._processChildContext(context),
      debugID,
    );



    return markup;
  },
  _renderValidatedComponent: function() {
    var renderedElement;
    renderedElement = this._renderValidatedComponentWithoutOwnerOrContext();

    return renderedElement;
  },
  _renderValidatedComponentWithoutOwnerOrContext: function() {
    var inst = this._instance;
    var renderedElement;

    renderedElement = inst.render();



    return renderedElement;
  },
}
```



### 结论


挂载的核心流程




- 创建组件实例




- class组件：new App(...)

- 函数组件：执行 App(props)

- 函数组件会被包装成 StatelessComponent，方便统一处理

- 执行 componentWillMount

- 执行 render，得到新的 ReactElement

- 对 render 返回的 ReactElement 继续 instantiateReactComponent，
然后递归 mount 子组件

- 生成 markup，并插入真实 DOM

- 将 componentDidMount 放入 ReactMountReady 队列

- 整棵树挂载完成后，统一执行 componentDidMount




## 更新状态



### 入口



```
this.setState({ count: this.state.count + 1 });
```


setState会通过原型找到ReactCopoment的实例方法
文件路径



```
ReactBaseClasses: src/isomorphic/modern/class/ReactBaseClasses.js
ReactReconcileTransaction：src/renderers/dom/client/ReactReconcileTransaction.js
Transaction: src/renderers/shared/utils/Transaction.js
CallbackQueue: src/renderers/shared/utils/CallbackQueue.js
ReactReconciler: src/renderers/shared/stack/reconciler/ReactReconciler.js
ReactCompositeComponent: src/renderers/shared/stack/reconciler/ReactCompositeComponent.js
instantiateReactComponent: src/renderers/shared/stack/reconciler/instantiateReactComponent.js
ReactCompositeComponentWrapper:
```


setState
调用过程


this.updater.enqueueSetState(this, partialState);


↓
ReactUpdates.enqueueUpdate(internalInstance);


ReactBaseClasses



```
function ReactComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;//兜底方法而已
}
ReactComponent.prototype.setState = function(partialState, callback) {
  this.updater.enqueueSetState(this, partialState);
  if (callback) {
    this.updater.enqueueCallback(this, callback, 'setState');
  }
};
```


this.updater.enqueueSetState，要找到ReactCompositeComponent的



```
var updateQueue = transaction.getUpdateQueue();
inst.updater = updateQueue;
```


上面有一段



```
var transaction = ReactUpdates.ReactReconcileTransaction.getPooled( /* useCreateElement */ !shouldReuseMarkup && ReactDOMFeatureFlags.useCreateElement, );
transaction.perform( mountComponentIntoNode, null, componentInstance, container, transaction, shouldReuseMarkup, context, );
```


所以transaction在ReactReconcileTransaction的getPooled


ReactReconcileTransaction



```
function ReactReconcileTransaction(useCreateElement: boolean) {
  this.reinitializeTransaction();
  // Only server-side rendering really needs this option (see
  // `ReactServerRendering`), but server-side uses
  // `ReactServerRenderingTransaction` instead. This option is here so that it's
  // accessible and defaults to false when `ReactDOMComponent` and
  // `ReactDOMTextComponent` checks it in `mountComponent`.`
  this.renderToStaticMarkup = false;
  this.reactMountReady = CallbackQueue.getPooled(null);
  this.useCreateElement = useCreateElement;
}
var Mixin = {
 /**
   * @return {object} The queue to collect `onDOMReady` callbacks with.
   */
  getReactMountReady: function() {
    return this.reactMountReady;
  },

  /**
   * @return {object} The queue to collect React async events.
   */
  getUpdateQueue: function() {
    return ReactUpdateQueue;
  },
}
Object.assign(ReactReconcileTransaction.prototype, Transaction, Mixin);
```


最终找到ReactUpdateQueue


ReactUpdateQueue



```
function enqueueUpdate(internalInstance) {
  ReactUpdates.enqueueUpdate(internalInstance);
}
var ReactUpdateQueue = {
  enqueueCallback: function(publicInstance, callback, callerName) {
    ReactUpdateQueue.validateCallback(callback, callerName);
    var internalInstance = getInternalInstanceReadyForUpdate(publicInstance);



    if (internalInstance._pendingCallbacks) {
      internalInstance._pendingCallbacks.push(callback);
    } else {
      internalInstance._pendingCallbacks = [callback];
    }

    enqueueUpdate(internalInstance);
  },
    enqueueSetState: function(publicInstance, partialState) {


    var internalInstance = getInternalInstanceReadyForUpdate(
      publicInstance,
      'setState',
    );

    if (!internalInstance) {
      return;
    }

    var queue =
      internalInstance._pendingStateQueue ||
      (internalInstance._pendingStateQueue = []);
    queue.push(partialState);

    enqueueUpdate(internalInstance);
  },
}
```


ReactUpdates



```
function enqueueUpdate(component) {

  if (!batchingStrategy.isBatchingUpdates) {//在初始化渲染我们已经看到开启，因此不会走这里，除非是异步环境
    batchingStrategy.batchedUpdates(enqueueUpdate, component);
    return;
  }

  dirtyComponents.push(component);
  if (component._updateBatchNumber == null) {
    component._updateBatchNumber = updateBatchNumber + 1;
  }
}
var ReactUpdates = {
  batchedUpdates: batchedUpdates,
  enqueueUpdate: enqueueUpdate,
};
```


`_pendingStateQueue`保存要更新的状态，`_pendingCallbacks`保存更新回调，最终这个需要更新的组件放到：`dirtyComponents`里面


从`this.setState`开始，我们从源码已经找完所有流程了，因此必须回到初始化流程，在初始化流程，有对`dirtyComponents`进行相关处理，我们之前为了找`ReactDom.render`主流程，做了一些忽略，现在我们需要从batchedUpdates继续看下去


ReactMount



```
// The initial render is synchronous but any updates that happen during 
// rendering, in componentWillMount or componentDidMount, will be batched 
// according to the current batching strategy.
ReactUpdates.batchedUpdates(  
    batchedMountComponentIntoNode,  
    componentInstance,  
    container,  
    shouldReuseMarkup,  
    context,  
);
```


回顾一下之前这里的注释，初始化render的时候会先同步操作，如果在渲染过程、componentWillMount、componentDidMount遇到setState，会开启批量
而dirtyComponents，会等同步操作也就是最后插入dom后进行处理，因此我们需要回到这里继续往下看


ReactUpdates.batchedUpdates

```
ReactUpdates.batchedUpdates//ReactMount
↓  
batchingStrategy.batchedUpdates(callback, a, b, c, d, e)//ReactUpdates
↓ 
transaction.perform(callback, null, a, b, c, d, e)//ReactDefaultBatchingStrategy
↓ 
transaction.perform//ReactMount
↓ 
this.closeAll(0);//Transaction(fn:perform)
↓ 
wrapper.close.call(this, initData);Transaction(fn:closeAll)
↓ 
ReactUpdates.flushBatchedUpdates.bind(ReactUpdates)//ReactDefaultBatchingStrategy
↓ 
transaction.perform(runBatchedUpdates, null, transaction);//ReactUpdates
↓ 
ReactReconciler.performUpdateIfNecessary(//ReactUpdates
   component,
   transaction.reconcileTransaction,
   updateBatchNumber,
);
↓ 
internalInstance.performUpdateIfNecessary(transaction);//ReactReconciler
↓ 
this.updateComponent(
     transaction,
     this._currentElement,
     this._currentElement,
     this._context,
     this._context,
   );//ReactCompositeComponent.performUpdateIfNecessary
↓ 
this._performComponentUpdate(
     nextParentElement,
     nextProps,
     nextState,
     nextContext,
     transaction,
     nextUnmaskedContext,
  );//ReactCompositeComponent.updateComponent
↓ 
this._updateRenderedComponent(transaction, unmaskedContext);//ReactCompositeComponent
```


如果type和key相同



```
ReactReconciler.receiveComponent( prevComponentInstance, nextRenderedElement, transaction, this._processChildContext(context), );//ReactCompositeComponent
↓ 
internalInstance.receiveComponent(nextElement, transaction, context);//ReactReconciler
↓ 
this.updateComponent(//ReactCompositeComponent
      transaction,
      prevElement,
      nextElement,
      prevContext,
      nextContext,
    );
```


ReactUpdates



```
function batchedUpdates(callback, a, b, c, d, e) {
  return batchingStrategy.batchedUpdates(callback, a, b, c, d, e);//batchingStrategy是注入进来的ReactDefaultBatchingStrategy，可以看render流程
}
var ReactUpdates = {
  batchedUpdates: batchedUpdates,
}
```


ReactDefaultBatchingStrategy



```
var RESET_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: function() {
    ReactDefaultBatchingStrategy.isBatchingUpdates = false;
  },
};

var FLUSH_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates),
};

var TRANSACTION_WRAPPERS = [FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];
Object.assign(ReactDefaultBatchingStrategyTransaction.prototype, Transaction, {
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },
});
var transaction = new ReactDefaultBatchingStrategyTransaction();
var ReactDefaultBatchingStrategy = {
  isBatchingUpdates: false,

  /**
   * Call the provided function in a context within which calls to `setState`
   * and friends are batched such that components aren't updated unnecessarily.
   */
  batchedUpdates: function(callback, a, b, c, d, e) {
      var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;

    ReactDefaultBatchingStrategy.isBatchingUpdates = true;
    
    if (alreadyBatchingUpdates) {
      return callback(a, b, c, d, e);
    } else {
      return transaction.perform(callback, null, a, b, c, d, e);//走的这里
    }
  },
};
```


无论是第一次render，还是用户操作更新，第一次都是false，虽然这里`ReactDefaultBatchingStrategy.isBatchingUpdates=true`，`transaction.perform`之后，处理dirtyComponents后，依然会`ReactDefaultBatchingStrategy.isBatchingUpdates=false`，因此如果我们想了解dirtyComponents是怎么处理的，走`transaction.perform(callback, null, a, b, c, d, e)`


Transaction



```
var TransactionImpl = {
  perform: function<
    A,
    B,
    C,
    D,
    E,
    F,
    G,
    T: (a: A, b: B, c: C, d: D, e: E, f: F) => G,
  >(method: T, scope: any, a: A, b: B, c: C, d: D, e: E, f: F): G {
    try {

      ret = method.call(scope, a, b, c, d, e, f);
      errorThrown = false;
    } finally {
      try {
        if (errorThrown) {
          try {
            this.closeAll(0);
          } catch (err) {}
        } else {
          // Since `method` didn't throw, we don't want to silence the exception
          // here.
          this.closeAll(0);
        }
      } finally {
        this._isInTransaction = false;
      }
    }
    return ret;
  },
  closeAll: function(startIndex: number): void {
    invariant(
      this.isInTransaction(),
      'Transaction.closeAll(): Cannot close transaction when none are open.',
    );
    var transactionWrappers = this.transactionWrappers;
    for (var i = startIndex; i < transactionWrappers.length; i++) {
      var wrapper = transactionWrappers[i];
      var initData = this.wrapperInitData[i];
      var errorThrown;
      try {
        errorThrown = true;
        if (initData !== OBSERVED_ERROR && wrapper.close) {
          wrapper.close.call(this, initData);
        }
        errorThrown = false;
      } finally {
        if (errorThrown) {
          // The closer for wrapper i threw an error; close the remaining
          // wrappers but silence any exceptions from them to ensure that the
          // first error is the one to bubble up.
          try {
            this.closeAll(i + 1);
          } catch (e) {}
        }
      }
    }
    this.wrapperInitData.length = 0;
  },
}
```


perform里面会执行mount，插入，这是render的主流程，而结束后会循环执行close，因此这里的`wrapper`实际上是`TRANSACTION_WRAPPERS`,只需要看`ReactUpdates.flushBatchedUpdates.bind(ReactUpdates)`就行


ReactUpdates



```
function runBatchedUpdates(transaction) {
  var len = transaction.dirtyComponentsLength;

  // Since reconciling a component higher in the owner hierarchy usually (not
  // always -- see shouldComponentUpdate()) will reconcile children, reconcile
  // them before their children by sorting the array.
  dirtyComponents.sort(mountOrderComparator);

  // Any updates enqueued while reconciling must be performed after this entire
  // batch. Otherwise, if dirtyComponents is [A, B] where A has children B and
  // C, B could update twice in a single batch if C's render enqueues an update
  // to B (since B would have already updated, we should skip it, and the only
  // way we can know to do so is by checking the batch counter).
  updateBatchNumber++;

  for (var i = 0; i < len; i++) {
    // If a component is unmounted before pending changes apply, it will still
    // be here, but we assume that it has cleared its _pendingCallbacks and
    // that performUpdateIfNecessary is a noop.
    var component = dirtyComponents[i];

    // If performUpdateIfNecessary happens to enqueue any new updates, we
    // shouldn't execute the callbacks until the next render happens, so
    // stash the callbacks first
    var callbacks = component._pendingCallbacks;
    component._pendingCallbacks = null;



    ReactReconciler.performUpdateIfNecessary(
      component,
      transaction.reconcileTransaction,
      updateBatchNumber,
    );

    if (markerName) {
      console.timeEnd(markerName);
    }

    if (callbacks) {
      for (var j = 0; j < callbacks.length; j++) {
        transaction.callbackQueue.enqueue(
          callbacks[j],
          component.getPublicInstance(),
        );
      }
    }
  }
}
var flushBatchedUpdates = function() {
  // ReactUpdatesFlushTransaction's wrappers will clear the dirtyComponents
  // array and perform any updates enqueued by mount-ready handlers (i.e.,
  // componentDidUpdate) but we need to check here too in order to catch
  // updates enqueued by setState callbacks and asap calls.
  while (dirtyComponents.length || asapEnqueued) {
    if (dirtyComponents.length) {
      var transaction = ReactUpdatesFlushTransaction.getPooled();
      transaction.perform(runBatchedUpdates, null, transaction);
      ReactUpdatesFlushTransaction.release(transaction);
    }
  }
};
var ReactUpdates = {
  enqueueUpdate: enqueueUpdate,
  flushBatchedUpdates: flushBatchedUpdates,
  injection: ReactUpdatesInjection,
}
```


flushBatchedUpdates里会做循环检查，因为一次setState的回调里，有可能再次setState，我们可以忽略transaction.perform里面的close，那是做dirtyComponents的清除以及处理回调里面setState，不是更新主流程，感兴趣可以自行查看


ReactReconciler



```
var ReactReconciler = {
  performUpdateIfNecessary: function(
    internalInstance,
    transaction,
    updateBatchNumber,
  ) {
    internalInstance.performUpdateIfNecessary(transaction);
  }
}
```


performUpdateIfNecessary是通过internalInstance去调用的，需要一步一步往回找，这里忽略过程，最终在ReactCompositeComponent能找到


ReactCompositeComponent



```
var ReactCompositeComponent = {
  performUpdateIfNecessary: function(transaction) {
    if (this._pendingElement != null) {//第二次执行ReactDom.render才会有值
      ReactReconciler.receiveComponent(
        this,
        this._pendingElement,
        transaction,
        this._context,
      );
    } else if (this._pendingStateQueue !== null || this._pendingForceUpdate) {
      this.updateComponent(
        transaction,
        this._currentElement,
        this._currentElement,
        this._context,
        this._context,
      );
    } else {
      this._updateBatchNumber = null;
    }
  },
  updateComponent: function(
    transaction,
    prevParentElement,
    nextParentElement,
    prevUnmaskedContext,
    nextUnmaskedContext,
  ) {
    var inst = this._instance;
 

    var willReceive = false;
    var nextContext;

    // Determine if the context has changed or not
    if (this._context === nextUnmaskedContext) {
      nextContext = inst.context;
    } else {
      nextContext = this._processContext(nextUnmaskedContext);
      willReceive = true;
    }

    var prevProps = prevParentElement.props;
    var nextProps = nextParentElement.props;

    // Not a simple state update but a props update
    if (prevParentElement !== nextParentElement) {
      willReceive = true;
    }

    // An update here will schedule an update but immediately set
    // _pendingStateQueue which will ensure that any state updates gets
    // immediately reconciled instead of waiting for the next batch.
    if (willReceive && inst.componentWillReceiveProps) {
      inst.componentWillReceiveProps(nextProps, nextContext);
    }

    var nextState = this._processPendingState(nextProps, nextContext);
    var shouldUpdate = true;

    if (!this._pendingForceUpdate) {
      if (inst.shouldComponentUpdate) {
         shouldUpdate = inst.shouldComponentUpdate(
            nextProps,
            nextState,
            nextContext,
          );
      } else {
        if (this._compositeType === CompositeTypes.PureClass) {
          shouldUpdate =
            !shallowEqual(prevProps, nextProps) ||
            !shallowEqual(inst.state, nextState);
        }
      }
    }



    this._updateBatchNumber = null;
    if (shouldUpdate) {
      this._pendingForceUpdate = false;
      // Will set `this.props`, `this.state` and `this.context`.
      this._performComponentUpdate(
        nextParentElement,
        nextProps,
        nextState,
        nextContext,
        transaction,
        nextUnmaskedContext,
      );
    } else {
      // If it's determined that a component should not update, we still want
      // to set props and state but we shortcut the rest of the update.
      this._currentElement = nextParentElement;
      this._context = nextUnmaskedContext;
      inst.props = nextProps;
      inst.state = nextState;
      inst.context = nextContext;
    }
  },
  _processPendingState: function(props, context) {
    var inst = this._instance;
    var queue = this._pendingStateQueue;
    var replace = this._pendingReplaceState;
    this._pendingReplaceState = false;
    this._pendingStateQueue = null;

    if (!queue) {
      return inst.state;
    }

    var nextState = Object.assign({}, inst.state);
    for (var i = 0; i < queue.length; i++) {
      var partial = queue[i];
      Object.assign(
        nextState,
        typeof partial === 'function'
          ? partial.call(inst, nextState, props, context)
          : partial,
      );
    }

    return nextState;
  },
  _performComponentUpdate: function(
    nextElement,
    nextProps,
    nextState,
    nextContext,
    transaction,
    unmaskedContext,
  ) {
    var inst = this._instance;

    var hasComponentDidUpdate = Boolean(inst.componentDidUpdate);
    var prevProps;
    var prevState;
    var prevContext;
    if (hasComponentDidUpdate) {
      prevProps = inst.props;
      prevState = inst.state;
      prevContext = inst.context;
    }

    if (inst.componentWillUpdate) {
      inst.componentWillUpdate(nextProps, nextState, nextContext);
    }

    this._currentElement = nextElement;
    this._context = unmaskedContext;
    inst.props = nextProps;
    inst.state = nextState;
    inst.context = nextContext;

    this._updateRenderedComponent(transaction, unmaskedContext);

    if (hasComponentDidUpdate) {
       transaction
          .getReactMountReady()
          .enqueue(
            inst.componentDidUpdate.bind(
              inst,
              prevProps,
              prevState,
              prevContext,
            ),
            inst,
          );
    }
  },
  _updateRenderedComponent: function(transaction, context) {
    var prevComponentInstance = this._renderedComponent;
    var prevRenderedElement = prevComponentInstance._currentElement;
    var nextRenderedElement = this._renderValidatedComponent();

    var debugID = 0;


    if (shouldUpdateReactComponent(prevRenderedElement, nextRenderedElement)) {
      ReactReconciler.receiveComponent(
        prevComponentInstance,
        nextRenderedElement,
        transaction,
        this._processChildContext(context),
      );
    } else {
      var oldHostNode = ReactReconciler.getHostNode(prevComponentInstance);
      ReactReconciler.unmountComponent(prevComponentInstance, false);

      var nodeType = ReactNodeTypes.getType(nextRenderedElement);
      this._renderedNodeType = nodeType;
      var child = this._instantiateReactComponent(
        nextRenderedElement,
        nodeType !== ReactNodeTypes.EMPTY /* shouldHaveDebugID */,
      );
      this._renderedComponent = child;

      var nextMarkup = ReactReconciler.mountComponent(
        child,
        transaction,
        this._hostParent,
        this._hostContainerInfo,
        this._processChildContext(context),
        debugID,
      );



      this._replaceNodeWithMarkup(
        oldHostNode,
        nextMarkup,
        prevComponentInstance,
      );
    }
  },
}
```




- 如果接收到新的 element，且定义了 componentWillReceiveProps，则执行（因为setState导致的更新，element不变，递归后续则会）

- 批量更新state的时候，会从state队列：pendingState遍历，执行Object.assign，这样最终结果就是：如果是普通值，因为一次次的覆盖，导致相同属性只会更新最后一个值；如果是函数，由于有有形参和返回，导致每次都能从之前的结果作为形参，参与计算，得到最新结果，通过函数作为返回值，做到实时更新而不是只更新最后一个值（如果后续递归的组件，该实例自己的 pendingStateQueue 不为空，才会真正合并）

- 默认shouldUpdade=true；shouldUpdade计算：如果组件定义shouldComponentUpdate，则执行shouldComponentUpdate作为返回值；如果没定义shouldComponentUpdate，且为purecomponent，则shouldUpdade=浅比较props跟state是否相同

- 如果shouldUpdade=false，只更新props、context、state，到此为止，否则进入后续的更新渲染（第5步）

- componentWillUpdate



6（1）对比新旧虚拟节点，如果type和key相同
ReactReconciler



```
var ReactReconciler = {
  receiveComponent: function(
    internalInstance,
    nextElement,
    transaction,
    context,
  ) {
    internalInstance.receiveComponent(nextElement, transaction, context);
  },
}
```


ReactCompositeComponent



```
var ReactCompositeComponent = {
  receiveComponent: function(nextElement, transaction, nextContext) {
    var prevElement = this._currentElement;
    var prevContext = this._context;

    this._pendingElement = null;

    this.updateComponent(
      transaction,
      prevElement,
      nextElement,
      prevContext,
      nextContext,
    );
  },
  
}
```


这里实际上是做递归，比如说



```
function App(){
    <Father/>
}
Class Father extends Component{
    render(){
        <div>
            <ul>
                {childs.map(item=>(<li><Child/></li>)}
            </ul>
        </div>
    }
}
```


当在App方法的时候定位到Father，发现Father没变化，也就是type跟key相同，于是通过this._renderedComponent找到



```
render(){
        <div>
            <ul>
                {childs.map(item=>(<li><Child/></li>)}
            </ul>
        </div>
    }
```


所对应 实例，所以就会找到div，然后又找到ul，最后又找到Child。这就是深度优先遍历方式。


如果是Child，执行updateComponet的操作就是重复之前的1-5。


但是了解ul做了什么，其实也很重要，因为刚刚只是同一个节点的自身的对比。type跟key相同则递归，不同则卸载旧节点，创建新节点。但是同层比较却不知道。因此需要看ul做了什么。


this.updateComponent中的this，往上（receiveComponent）可追溯到internalInstance，而ul的实例跟Child的实例，是不同的。


再往上（ReactCompositeComponent._updateRenderedComponent）可追溯到_renderedComponent的返回值，而_renderedComponent的赋值在
ReactCompositeComponent



```
var child = this._instantiateReactComponent(
      renderedElement,
      nodeType !== ReactNodeTypes.EMPTY /* shouldHaveDebugID */,
    );
    this._renderedComponent = child;
```


_instantiateReactComponent在文件instantiateReactComponent的instantiateReactComponent方法，而之前我们找组件的时候用的都是ReactCompositeComponentWrapper



```
instance = new ReactCompositeComponentWrapper(element);
return instance
```


但是如果我们想知道ul的实例：


ReactHostComponent



```
instance = ReactHostComponent.createInternalComponent(element);
```


ReactHostComponent



```
injectGenericComponentClass: function(componentClass) {
    genericComponentClass = componentClass;
  },
function createInternalComponent(element) {
  return new genericComponentClass(element);
}
```


ReactDefaultInjection



```
ReactInjection.HostComponent.injectGenericComponentClass(ReactDOMComponent);
```


终于找到ul实例的时候，因此原来internalInstance.receiveComponent的调用者实际上是ReactDOMComponent


ReactDOMComponent



```
ReactDOMComponent.Mixin = {
receiveComponent: function(nextElement, transaction, context) {
    var prevElement = this._currentElement;
    this._currentElement = nextElement;
    this.updateComponent(transaction, prevElement, nextElement, context);
  },
  updateComponent: function(transaction, prevElement, nextElement, context) {
    var lastProps = prevElement.props;
    var nextProps = this._currentElement.props;

    assertValidProps(this, nextProps);
    this._updateDOMProperties(lastProps, nextProps, transaction);
    this._updateDOMChildren(lastProps, nextProps, transaction, context);
  },
 _updateDOMChildren: function(lastProps, nextProps, transaction, context) {
    var lastContent = CONTENT_TYPES[typeof lastProps.children]
      ? lastProps.children
      : null;
    var nextContent = CONTENT_TYPES[typeof nextProps.children]
      ? nextProps.children
      : null;

    // Note the use of `!=` which checks for null or undefined.
    var lastChildren = lastContent != null ? null : lastProps.children;
    var nextChildren = nextContent != null ? null : nextProps.children;

    // If we're switching from children to content/html or vice versa, remove
    // the old content
    var lastHasContentOrHtml = lastContent != null || lastHtml != null;
    var nextHasContentOrHtml = nextContent != null || nextHtml != null;
    if (lastChildren != null && nextChildren == null) {//旧子节点有值，新子节点为空
      this.updateChildren(null, transaction, context);
    } 

    if (nextChildren != null) {//新子节点不为空
      this.updateChildren(nextChildren, transaction, context);
    }
  },

}
Object.assign(
  ReactDOMComponent.prototype,
  ReactDOMComponent.Mixin,
  ReactMultiChild.Mixin,
);
```


ReactMultiChild



```
var ReactMultiChild = {
    Mixin:{
     updateChildren: function(nextNestedChildrenElements, transaction, context) {
      // Hook used by React ART
      this._updateChildren(nextNestedChildrenElements, transaction, context);
    },
    _updateChildren: function(
      nextNestedChildrenElements,
      transaction,
      context,
    ) {
      var prevChildren = this._renderedChildren;
      var removedNodes = {};
      var mountImages = [];
      var nextChildren = this._reconcilerUpdateChildren(
        prevChildren,
        nextNestedChildrenElements,
        mountImages,
        removedNodes,
        transaction,
        context,
      );
      if (!nextChildren && !prevChildren) {
        return;
      }
      var updates = null;
      var name;
      // `nextIndex` will increment for each child in `nextChildren`, but
      // `lastIndex` will be the last index visited in `prevChildren`.
      var nextIndex = 0;
      var lastIndex = 0;
      // `nextMountIndex` will increment for each newly mounted child.
      var nextMountIndex = 0;
      var lastPlacedNode = null;
      for (name in nextChildren) {
        if (!nextChildren.hasOwnProperty(name)) {
          continue;
        }
        var prevChild = prevChildren && prevChildren[name];
        var nextChild = nextChildren[name];
        if (prevChild === nextChild) {
          updates = enqueue(
            updates,
            this.moveChild(prevChild, lastPlacedNode, nextIndex, lastIndex),
          );
          lastIndex = Math.max(prevChild._mountIndex, lastIndex);
          prevChild._mountIndex = nextIndex;
        } else {
          if (prevChild) {
            // Update `lastIndex` before `_mountIndex` gets unset by unmounting.
            lastIndex = Math.max(prevChild._mountIndex, lastIndex);
            // The `removedNodes` loop below will actually remove the child.
          }
          // The child must be instantiated before it's mounted.
          updates = enqueue(
            updates,
            this._mountChildAtIndex(
              nextChild,
              mountImages[nextMountIndex],
              lastPlacedNode,
              nextIndex,
              transaction,
              context,
            ),
          );
          nextMountIndex++;
        }
        nextIndex++;
        lastPlacedNode = ReactReconciler.getHostNode(nextChild);
      }
      // Remove children that are no longer present.
      for (name in removedNodes) {
        if (removedNodes.hasOwnProperty(name)) {
          updates = enqueue(
            updates,
            this._unmountChild(prevChildren[name], removedNodes[name]),
          );
        }
      }
      if (updates) {
        processQueue(this, updates);
      }
      this._renderedChildren = nextChildren;

    
    },
    _reconcilerUpdateChildren: function(
      prevChildren,
      nextNestedChildrenElements,
      mountImages,
      removedNodes,
      transaction,
      context,
    ) {
      var nextChildren;
      var selfDebugID = 0;

      nextChildren = flattenChildren(nextNestedChildrenElements, selfDebugID);
      ReactChildReconciler.updateChildren(
        prevChildren,
        nextChildren,
        mountImages,
        removedNodes,
        transaction,
        this,
        this._hostContainerInfo,
        context,
        selfDebugID,
      );
      return nextChildren;
    },

    }
}
```


ReactChildReconciler



```
var ReactChildReconciler = {
 updateChildren: function(
    prevChildren,
    nextChildren,
    mountImages,
    removedNodes,
    transaction,
    hostParent,
    hostContainerInfo,
    context,
    selfDebugID, // 0 in production and for roots
  ) {

    if (!nextChildren && !prevChildren) {
      return;
    }
    var name;
    var prevChild;
    for (name in nextChildren) {
      if (!nextChildren.hasOwnProperty(name)) {
        continue;
      }
      prevChild = prevChildren && prevChildren[name];
      var prevElement = prevChild && prevChild._currentElement;
      var nextElement = nextChildren[name];
      if (
        prevChild != null &&
        shouldUpdateReactComponent(prevElement, nextElement)
      ) {
        ReactReconciler.receiveComponent(
          prevChild,
          nextElement,
          transaction,
          context,
        );
        nextChildren[name] = prevChild;
      } else {
        if (prevChild) {
          removedNodes[name] = ReactReconciler.getHostNode(prevChild);
          ReactReconciler.unmountComponent(prevChild, false);
        }
        // The child must be instantiated before it's mounted.
        var nextChildInstance = instantiateReactComponent(nextElement, true);
        nextChildren[name] = nextChildInstance;
        // Creating mount image now ensures refs are resolved in right order
        // (see https://github.com/facebook/react/pull/7101 for explanation).
        var nextChildMountImage = ReactReconciler.mountComponent(
          nextChildInstance,
          transaction,
          hostParent,
          hostContainerInfo,
          context,
          selfDebugID,
        );
        mountImages.push(nextChildMountImage);
      }
    }
    // Unmount children that are no longer present.
    for (name in prevChildren) {
      if (
        prevChildren.hasOwnProperty(name) &&
        !(nextChildren && nextChildren.hasOwnProperty(name))
      ) {
        prevChild = prevChildren[name];
        removedNodes[name] = ReactReconciler.getHostNode(prevChild);
        ReactReconciler.unmountComponent(prevChild, false);
      }
    }
  },

}
```


在对比之前会做一个扁平化操作，并不是数组与数组的比较，而是对象



```
<ul>
  <li key="a" />
  <li key="b" />
  <li key="c" />
</ul>

prevChildren = {  
'.$a': liInstanceA,  
'.$b': liInstanceB,  
'.$c': liInstanceC  
}  
  
nextChildren = {  
'.$a': liElementA,  
'.$b': liElementB,  
'.$d': liElementD  
}
```




- 循环新的chilren的key map。在同一个key下，对比新旧子节点，如果type不同，卸载旧节点，创建新节点，如果相同，复用旧实例，更新props等操作

- 循环旧的chilren的key map。如果key在新的map找不到，则收集旧节点。

- 循环新的chilren的key map。记录key对应旧节点所在位置的最大值。如果发现出现某个key的位置（旧节点)小于最大位置，则把旧节点的位置插入到最大位置之后。（说明，因为按照新的chilren的kay去遍历，同层key所对应新的chilren节点的位置本来就是最新位置，而如果所对应的key的旧同通常节点，每次都能找到最大值，就说明顺序完全没变过，一模一样，但是如果出现某个旧节点的index比最大index小，就说明这个旧节点以前是在前面，但是现在在被遍历当前节点的后一个，则需要做一个挪动处理）。如果新的节点在相同key发现以前没有，则创建新的节点。

- 最后把之前收集需要卸载的旧节点遍历一遍，进行卸载。



6（2）对比新旧虚拟节点，如果type或key不同
6.2.1. 如果有componentWillUnmount，旧的虚拟节点：执行componentWillUnmount，递归虚拟树执行componentWillUnmount，清空队列，断开引用，等待回收


ReactCompositeComponent



```
ReactReconciler.unmountComponent(prevComponentInstance, false);
```



```
unmountComponent: function(safely) {
    if (!this._renderedComponent) {
      return;
    }

    var inst = this._instance;

    if (inst.componentWillUnmount && !inst._calledComponentWillUnmount) {
      inst._calledComponentWillUnmount = true;

     inst.componentWillUnmount();
    }

    if (this._renderedComponent) {
      ReactReconciler.unmountComponent(this._renderedComponent, safely);
      this._renderedNodeType = null;
      this._renderedComponent = null;
      this._instance = null;
    }

    // Reset pending fields
    // Even if this component is scheduled for another update in ReactUpdates,
    // it would still be ignored because these fields are reset.
    this._pendingStateQueue = null;
    this._pendingReplaceState = false;
    this._pendingForceUpdate = false;
    this._pendingCallbacks = null;
    this._pendingElement = null;

    // These fields do not really need to be reset since this object is no
    // longer accessible.
    this._context = null;
    this._rootNodeID = 0;
    this._topLevelWrapper = null;


    ReactInstanceMap.remove(inst);


  },
```


6.2.2. 现在同一个节点的子组件，重新创建子组件实例（初始化渲染那一套，constructor、WillMount、render、mount）




- 如果有componentDidUpdate，则进入队列后执行




### 结论


更新的核心流程




- 找到当前组件对应的 internalInstance

- 把 partialState 放进：
internalInstance._pendingStateQueue

- 如果有 callback，把 callback 放进：
internalInstance._pendingCallbacks

- 把 internalInstance 放进：
dirtyComponents

- 等当前 batch 结束后：
flushBatchedUpdates()
↓
处理 dirtyComponents
↓
合并 _pendingStateQueue
↓
得到 nextState
↓
render
↓
diff
↓
更新 DOM
↓
执行 _pendingCallbacks