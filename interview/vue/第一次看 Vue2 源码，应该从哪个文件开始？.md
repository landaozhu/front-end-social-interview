# 第一次看 Vue2 源码，应该从哪个文件开始？

> 来源: https://juejin.cn/post/7658158057848717339

> Vue2 源码到底该从哪里开始看？本文将从 `new Vue()` 出发，结合源码文件url地址、关键代码，一步一步理清 Vue2 主流程，大家可以在本文的基础上，再进一步详细学习


业务代码


这是一段正常业务项目里面的常规入口写法：



```hljs javascript code-block-extension-codeShowNum
import Vue from "vue";
import App from "./app.vue";
new Vue({
  el: "#app",
  router,
  template: "<App/>",
  components: { App }
});
```


源码地址：[github1s.com/vuejs/vue/b…](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fvuejs%2Fvue%2Fblob%2F2.6%2Fpackage.json%23L6)



## Vue的工程化配置


从package.json找到build之后的文件：[github1s.com/vuejs/vue/b…](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fvuejs%2Fvue%2Fblob%2F2.6%2Fscripts%2Fbuild.js%23L16)



```hljs json code-block-extension-codeShowNum
"build": "node scripts/build.js",
```


scripts/build.js的关键代码：



```hljs javascript code-block-extension-codeShowNum
if (process.argv[2]) {
  const filters = process.argv[2].split(',')
  builds = builds.filter(b => {
    return filters.some(f => b.output.file.indexOf(f) > -1 || b._name.indexOf(f) > -1)
  })
} else {
  // filter out weex builds by default
  builds = builds.filter(b => {
    return b.output.file.indexOf('weex') === -1
  })
}
```


config:[github1s.com/vuejs/vue/b…](https://link.juejin.cn/?target=https%3A%2F%2Fgithub1s.com%2Fvuejs%2Fvue%2Fblob%2F2.6%2Fscripts%2Fconfig.js%23L125)
这里是根据不同的脚本命令打出不同包，例如node scripts/build.js，没有process.argv[2]，则除了weex，config里面都打了，在config可以找到打包产物和源文件的map


例如webpack的alias有配置如下



```hljs arduino code-block-extension-codeShowNum
'vue$': 'vue/dist/vue.esm.js',
```


通过dist可以找到config的map



```hljs JavaScript code-block-extension-codeShowNum
'web-full-esm': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.esm.js'),
    format: 'es',
    alias: { he: './entity-decoder' },
    banner
  },
```


`entry-runtime-with-compiler.js` 表示该构建产物包含 **compiler**，支持 **运行时编译**；而 `web/entry-runtime.js` 只包含 runtime，不支持运行时编译。


运行时编译的典型场景是：



```hljs arduino code-block-extension-codeShowNum
template: "<App/>"
```


Vue 会在初始化阶段，把 template 转成 **AST（抽象语法树）** ，做静态节点优化后，再生成 render 函数，最终交给 runtime 渲染。


因此这类写法会引入 compiler，包体积更大，同时存在一次运行时编译开销。现代项目一般不需要这种方式，因为 `.vue` 文件会通过 `vue-loader` 在打包阶段提前编译：**template → AST → render**，最终只需要 `runtime.js` 即可。



## Vue初始化做了什么


顺着runtime.js可以发现如下核心代码



```hljs javascript code-block-extension-codeShowNum
import Vue from 'core/index'
import { mountComponent } from 'core/instance/lifecycle'
import { patch } from './patch'
Vue.prototype.__patch__ = inBrowser ? patch : noop
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
export default Vue
```


继续看`core/index`



```hljs javascript code-block-extension-codeShowNum
import Vue from './instance/index'

initGlobalAPI(Vue)//初始化全局对象

export default Vue
```


instance/index



```hljs javascript code-block-extension-codeShowNum
function Vue (options) {
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
```


这是es5写法，所以



```hljs javascript code-block-extension-codeShowNum
function Vue (options) {
  this._init(options)
}
```


相当于构造函数，new Vue的时候会执行，_init的定义在initMixin里面



```hljs javascript code-block-extension-codeShowNum
Vue.prototype._init = function(){
    callHook(vm, 'beforeCreate')
    initState(vm)
    callHook(vm, 'created')       
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
}
```


在这个函数大概就是执行了生命周期里面的beforeCreate、初始化state等，created，最后执行mount，而mount，而mount，而mount的定义在runtime，因此执行`core/instance/lifecycle`的mountComponent



```hljs JavaScript code-block-extension-codeShowNum
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  callHook(vm, 'beforeMount')
  updateComponent = () => {
    vm._update(vm._render(), hydrating)
  }
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
```


因此，mountComponent 的核心不是单纯执行生命周期，而是创建 render watcher。这个 watcher 在初始化时会立即执行 updateComponent，完成首次渲染；后续数据变化时，会再次触发 updateComponent，重新执行 _render 和 _update。beforeMount 在首次渲染前触发，mounted 在首次挂载完成后触发，而 beforeUpdate 则是在后续更新前触发。



## 渲染


初始化渲染


instance/index



```hljs javascript code-block-extension-codeShowNum
renderMixin(Vue)
```


在renderMixin挂载了_render,在mountComponent执行



```hljs scss code-block-extension-codeShowNum
function mountComponent(){
  vm._update(vm._render(), hydrating)
}
```


instance/render.js



```hljs javascript code-block-extension-codeShowNum
function renderMixin(){
  Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options
    let vnode = render.call(vm._renderProxy, vm.$createElement)
    vnode.parent = _parentVnode
    return vnode
  }
}
```


根据传入render，或者把template编译的render，把createElement转成虚拟dom，返回给_update
instance/lifecycle.js



```hljs javascript code-block-extension-codeShowNum
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    vm._vnode = vnode
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode)
    }

    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
  }
```


*update会把虚拟dom传给__patch*_，从上文可得知__patch__在runtime/patch.js
runtime/patch.js



```hljs javascript code-block-extension-codeShowNum
import { createPatchFunction } from 'core/vdom/patch'
export const patch: Function = createPatchFunction({
  nodeOps,
  modules,
  LONG_LIST_THRESHOLD: 10
})
```


core/vdom/patch



```hljs Javascript code-block-extension-codeShowNum
export function createPatchFunction (backend) {

function patchVnode (
  oldVnode,
  vnode,
  insertedVnodeQueue,
  ownerArray,
  index,
  removeOnly
) {
  // --------------------------
  // 1. 完全相同引用：直接返回（最常见优化）
  // --------------------------
  if (oldVnode === vnode) {
    return
  }

  // --------------------------
  // 2. 新vnode已挂载过且在数组中：克隆一份避免污染旧节点
  // --------------------------
  if (isDef(vnode.elm) && isDef(ownerArray)) {
    // 复用节点时，克隆新vnode，防止原数据被修改
    vnode = ownerArray[index] = cloneVNode(vnode)
  }

  // --------------------------
  // 3. 复用真实 DOM：新vnode.elm 指向旧vnode的真实元素
  // --------------------------
  const elm = vnode.elm = oldVnode.elm

  // --------------------------
  // 4. 异步组件占位符特殊处理
  // --------------------------
  if (isTrue(oldVnode.isAsyncPlaceholder)) {
    if (isDef(vnode.asyncFactory.resolved)) {
      hydrate(oldVnode.elm, vnode, insertedVnodeQueue)
    } else {
      vnode.isAsyncPlaceholder = true
    }
    return
  }

  // --------------------------
  // 5. 静态节点 / v-once：直接复用实例，不更新
  // --------------------------
  if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))) {
    vnode.componentInstance = oldVnode.componentInstance
    return
  }

  // --------------------------
  // 6. 执行 data.hook.prepatch（更新前钩子）
  // --------------------------
  let i
  const data = vnode.data
  if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
    i(oldVnode, vnode)
  }

  // --------------------------
  // 7. 取出新旧子节点
  // --------------------------
  const oldCh = oldVnode.children
  const ch = vnode.children

  // --------------------------
  // 8. 非文本节点：更新属性 + 子节点
  // --------------------------
  if (isUndef(vnode.text)) {
    // 更新当前节点的属性、class、style、指令等
     // cbs.update = [  
  // updateAttrs, // attrs：id、title、placeholder、disabled 等 attribute  
  // updateClass, // class  
  // updateDOMListeners, // @click / @input 等原生 DOM 事件  
  // updateDOMProps, // domProps：value、innerHTML、textContent、checked 等 DOM property  
  // updateStyle, // style  
  // updateDirectives, // v-show / 自定义指令等  
  // updateRef // ref 变化时更新 $refs  
  // ]

    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }

    // 子节点对比核心
    if (isDef(oldCh) && isDef(ch)) {
      // 新旧都有子节点 → 执行 updateChildren（双端 diff）
      if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, ownerArray, index, removeOnly)
    } else if (isDef(ch)) {
      // 旧无、新有子节点 → 先清空旧文本，再批量创建新子节点
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
    } else if (isDef(oldCh)) {
      // 旧有、新无子节点 → 全部删除旧子节点
      removeVnodes(elm, oldCh, 0, oldCh.length - 1)
    } else if (isDef(oldVnode.text)) {
      // 都无子节点，但旧有文本 → 清空文本
      nodeOps.setTextContent(elm, '')
    }

  // --------------------------
  // 9. 文本节点：直接更新文本
  // --------------------------
  } else if (oldVnode.text !== vnode.text) {
    nodeOps.setTextContent(elm, vnode.text)
  }

  // --------------------------
  // 10. 执行 data.hook.postpatch（更新后钩子）
  // --------------------------
  if (isDef(data)) {
    if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
  }
}

  return function patch (oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
      return
    }

    let isInitialPatch = false
    const insertedVnodeQueue = []

    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true
      createElm(vnode, insertedVnodeQueue)
    } else {
      const isRealElement = isDef(oldVnode.nodeType)
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
      } else {
        if (isRealElement) {
       
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          oldVnode = emptyNodeAt(oldVnode)
        }

        // replacing existing element
        const oldElm = oldVnode.elm
        const parentElm = nodeOps.parentNode(oldElm)

        // create new node
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm)
        )

        // update parent placeholder node element, recursively
        if (isDef(vnode.parent)) {
          let ancestor = vnode.parent
          const patchable = isPatchable(vnode)
          while (ancestor) {
            for (let i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor)
            }
            ancestor.elm = vnode.elm
            if (patchable) {
              for (let i = 0; i < cbs.create.length; ++i) {
                cbs.create[i](emptyNode, ancestor)
              }
              // #6513
              // invoke insert hooks that may have been merged by create hooks.
              // e.g. for directives that uses the "inserted" hook.
              const insert = ancestor.data.hook.insert
              if (insert.merged) {
                // start at index 1 to avoid re-invoking component mounted hook
                for (let i = 1; i < insert.fns.length; i++) {
                  insert.fns[i]()
                }
              }
            } else {
              registerRef(ancestor)
            }
            ancestor = ancestor.parent
          }
        }

        // destroy old node
        if (isDef(parentElm)) {
          removeVnodes([oldVnode], 0, 0)
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode)
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
  }
}
```


create-components.js



```hljs javascript code-block-extension-codeShowNum
const componentVnodeHooks={
  prepatch(oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
    const options = vnode.componentOptions
    const child = (vnode.componentInstance = oldVnode.componentInstance)
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    )
  },
}
```


core/instance/lifecycile.js



```hljs javascript code-block-extension-codeShowNum
export function updateChildComponent (
  vm: Component,
  propsData: ?Object,
  listeners: ?Object,
  parentVnode: MountedComponentVNode,
  renderChildren: ?Array<VNode>
) {
  if (process.env.NODE_ENV !== 'production') {
    isUpdatingChildComponent = true
  }

  // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren.

  // check if there are dynamic scopedSlots (hand-written or compiled but with
  // dynamic slot names). Static scoped slots compiled from template has the
  // "$stable" marker.
  const newScopedSlots = parentVnode.data.scopedSlots
  const oldScopedSlots = vm.$scopedSlots
  const hasDynamicScopedSlot = !!(
    (newScopedSlots && !newScopedSlots.$stable) ||
    (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
    (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key) ||
    (!newScopedSlots && vm.$scopedSlots.$key)
  )

  // Any static slot children from the parent may have changed during parent's
  // update. Dynamic scoped slots may also have changed. In such cases, a forced
  // update is necessary to ensure correctness.
  const needsForceUpdate = !!(
    renderChildren ||               // has new static slots
    vm.$options._renderChildren ||  // has old static slots
    hasDynamicScopedSlot
  )

  vm.$options._parentVnode = parentVnode
  vm.$vnode = parentVnode // update vm's placeholder node without re-render

  if (vm._vnode) { // update child tree's parent
    vm._vnode.parent = parentVnode
  }
  vm.$options._renderChildren = renderChildren

  // update $attrs and $listeners hash
  // these are also reactive so they may trigger child update if the child
  // used them during render
  vm.$attrs = parentVnode.data.attrs || emptyObject
  vm.$listeners = listeners || emptyObject

  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false)
    const props = vm._props
    const propKeys = vm.$options._propKeys || []
    for (let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i]
      const propOptions: any = vm.$options.props // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm)
    }
    toggleObserving(true)
    // keep a copy of raw propsData
    vm.$options.propsData = propsData
  }

  // update listeners
  listeners = listeners || emptyObject
  const oldListeners = vm.$options._parentListeners
  vm.$options._parentListeners = listeners
  updateComponentListeners(vm, listeners, oldListeners)

  // resolve slots + force update if has children
  if (needsForceUpdate) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context)
    vm.$forceUpdate()
  }

  if (process.env.NODE_ENV !== 'production') {
    isUpdatingChildComponent = false
  }
}
```


这个方法是创建跟更新共用的




- 如果是新节点不存在，则对旧节点进行递归销毁

- 如果旧节点不存在，则创建新节点

- 如果旧节点存在，且为虚拟dom，且跟新的虚拟dom相同（tag、key等）


- 3.1 如果节点完全相同，跳过

- 3.2 复用旧的真实dom节点（复用后在此基础上修改）

- 3.3 复用旧的实例。如果是v-once到此为止，否则更新插槽、listener、attrs、props

- 3.4 如果新子节点为非文本节点（元素节点），更新当前节点的属性、class、style、指令等

- 3.5 如果新子节点为非文本节点（元素节点），对比新旧子节点


- 3.5.1 如果新旧子节点都存在，则双端diff对比

- 3.5.2 如果旧子节点不是元素节点，也不是文本节点，批量创建新子节点插入到旧节点下

- 3.5.3 如果旧子节点不是元素节点，而是文本节点，清空文本节点后，批量创建新子节点插入到旧节点下

- 3.5.4 如果存在旧子节点，但不存在新的子节点，则把旧子节点全部卸载

- 3.5.5 如果新旧子节点都不存在，但是旧子节点是文本节点，则清空文本

- 3.6 如果新字节点是文本节点，则在旧的节点清空并更新文本

- 如果旧节点是真实dom（根elemnt挂载点，例如#app），把真实dom包装成虚拟dom

- 如果旧节点存在，且为虚拟dom，但是跟新的虚拟dom不同（tag、key等），则把新的虚拟dom创建新真实dom节点，插入到旧的真实dom后面；当 vnode 被替换生成新的真实 DOM 后，如果这个 vnode 处在组件占位链上，Vue 会沿 parent 链向上，把新的 DOM 更新到父组件保存的占位 vnode 上，并重新执行 class、style、ref、指令等绑定逻辑



双端diff



```hljs Javascript code-block-extension-codeShowNum
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
  // 旧 children 的头指针
  let oldStartIdx = 0

  // 新 children 的头指针
  let newStartIdx = 0

  // 旧 children 的尾指针
  let oldEndIdx = oldCh.length - 1

  // 旧头 vnode
  let oldStartVnode = oldCh[0]

  // 旧尾 vnode
  let oldEndVnode = oldCh[oldEndIdx]

  // 新 children 的尾指针
  let newEndIdx = newCh.length - 1

  // 新头 vnode
  let newStartVnode = newCh[0]

  // 新尾 vnode
  let newEndVnode = newCh[newEndIdx]

  // oldKeyToIdx：旧节点 key 到 index 的映射
  // idxInOld：新节点在旧 children 中找到的位置
  // vnodeToMove：准备移动的旧 vnode
  // refElm：插入新节点时的参考 DOM 节点
  let oldKeyToIdx, idxInOld, vnodeToMove, refElm

  // removeOnly 只用于 <transition-group>
  // 为了保证离场动画期间，被删除元素的相对位置不乱
  // 一般场景 canMove 为 true，表示可以移动 DOM
  const canMove = !removeOnly


  // 双端 diff 主循环
  // 只要旧 children 和新 children 都还没处理完，就继续比较
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {

    // 旧头 vnode 是 undefined
    // 说明这个位置的旧 vnode 已经被移动过了
    // 例如 oldCh[idxInOld] = undefined
    // 所以旧头指针右移
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx]

    // 旧尾 vnode 是 undefined
    // 同理，说明这个位置已经被移动过
    // 所以旧尾指针左移
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx]

    // 情况 1：旧头 和 新头 是同一个 vnode
    // 说明这个节点位置没变，直接 patch
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(
        oldStartVnode,
        newStartVnode,
        insertedVnodeQueue,
        newCh,
        newStartIdx
      )

      // 旧头、新头都处理完，两个头指针都右移
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]

    // 情况 2：旧尾 和 新尾 是同一个 vnode
    // 说明尾部节点位置没变，直接 patch
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(
        oldEndVnode,
        newEndVnode,
        insertedVnodeQueue,
        newCh,
        newEndIdx
      )

      // 旧尾、新尾都处理完，两个尾指针都左移
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]

    // 情况 3：旧头 和 新尾 是同一个 vnode
    // 说明旧头节点被移动到了右边
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(
        oldStartVnode,
        newEndVnode,
        insertedVnodeQueue,
        newCh,
        newEndIdx
      )

      // 把旧头真实 DOM 移动到旧尾真实 DOM 的后面
      // insertBefore(a, b, nextSibling(c))
      // 等价于把 b 插到 c 后面
      canMove && nodeOps.insertBefore(
        parentElm,
        oldStartVnode.elm,
        nodeOps.nextSibling(oldEndVnode.elm)
      )

      // 旧头处理完，旧头右移
      // 新尾处理完，新尾左移
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]

    // 情况 4：旧尾 和 新头 是同一个 vnode
    // 说明旧尾节点被移动到了左边
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(
        oldEndVnode,
        newStartVnode,
        insertedVnodeQueue,
        newCh,
        newStartIdx
      )

      // 把旧尾真实 DOM 移动到旧头真实 DOM 的前面
      canMove && nodeOps.insertBefore(
        parentElm,
        oldEndVnode.elm,
        oldStartVnode.elm
      )

      // 旧尾处理完，旧尾左移
      // 新头处理完，新头右移
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]

    // 四种头尾比较都没命中
    // 就用 key 去旧 children 里找新头节点
    } else {

      // 第一次需要查找时，才创建 key -> index 映射
      // 避免一开始就遍历 oldCh
      if (isUndef(oldKeyToIdx)) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
      }

      // 如果新头 vnode 有 key，就通过 key 快速找旧节点位置
      // 如果没有 key，就退化成遍历查找
      idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdx[newStartVnode.key]
        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)

      // 旧 children 里找不到新头 vnode
      // 说明这是一个新节点
      if (isUndef(idxInOld)) {
        createElm(
          newStartVnode,
          insertedVnodeQueue,
          parentElm,
          oldStartVnode.elm, // 插到当前旧头 DOM 前面
          false,
          newCh,
          newStartIdx
        )

      // 旧 children 里找到了可能可复用的 vnode
      } else {
        vnodeToMove = oldCh[idxInOld]

        // 找到的旧 vnode 和新头 vnode 确实是同一个 vnode
        if (sameVnode(vnodeToMove, newStartVnode)) {
          patchVnode(
            vnodeToMove,
            newStartVnode,
            insertedVnodeQueue,
            newCh,
            newStartIdx
          )

          // 这个旧位置已经被移动走了
          // 置为 undefined，后面头尾指针碰到会跳过
          oldCh[idxInOld] = undefined

          // 把这个旧节点的真实 DOM 移动到当前旧头 DOM 前面
          canMove && nodeOps.insertBefore(
            parentElm,
            vnodeToMove.elm,
            oldStartVnode.elm
          )

        // key 相同，但 tag / input type 等不同
        // 不能复用，按新节点创建
        } else {
          createElm(
            newStartVnode,
            insertedVnodeQueue,
            parentElm,
            oldStartVnode.elm,
            false,
            newCh,
            newStartIdx
          )
        }
      }

      // 新头处理完，新头指针右移
      newStartVnode = newCh[++newStartIdx]
    }
  }

  // 循环结束后，如果旧 children 先处理完
  // 说明新 children 还有剩余节点，需要批量新增
  if (oldStartIdx > oldEndIdx) {
    // 找到插入参考点
    // 如果 newCh[newEndIdx + 1] 存在，就插到它前面
    // 如果不存在，refElm 为 null，表示 append 到末尾
    refElm = isUndef(newCh[newEndIdx + 1])
      ? null
      : newCh[newEndIdx + 1].elm

    addVnodes(
      parentElm,
      refElm,
      newCh,
      newStartIdx,
      newEndIdx,
      insertedVnodeQueue
    )

  // 如果新 children 先处理完
  // 说明旧 children 还有剩余节点，需要批量删除
  } else if (newStartIdx > newEndIdx) {
    removeVnodes(oldCh, oldStartIdx, oldEndIdx)
  }
}
```