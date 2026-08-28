# 作为一个vuer，为什么一定要知道composition-api

> 来源: https://juejin.cn/post/6969958355200639013

.markdown-body{word-break:break-word;line-height:1.75;font-weight:400;font-size:16px;overflow-x:hidden;color:#252933}.markdown-body h1,.markdown-body h2,.markdown-body h3,.markdown-body h4,.markdown-body h5,.markdown-body h6{line-height:1.5;margin-top:35px;margin-bottom:10px;padding-bottom:5px}.markdown-body h1{font-size:24px;line-height:38px;margin-bottom:5px}.markdown-body h2{font-size:22px;line-height:34px;padding-bottom:12px;border-bottom:1px solid #ececec}.markdown-body h3{font-size:20px;line-height:28px}.markdown-body h4{font-size:18px;line-height:26px}.markdown-body h5{font-size:17px;line-height:24px}.markdown-body h6{font-size:16px;line-height:24px}.markdown-body p{line-height:inherit;margin-top:22px;margin-bottom:22px}.markdown-body img{max-width:100%}.markdown-body hr{border:none;border-top:1px solid #ddd;margin-top:32px;margin-bottom:32px}.markdown-body code{word-break:break-word;border-radius:2px;overflow-x:auto;background-color:#fff5f5;color:#ff502c;font-size:.87em;padding:.065em .4em}.markdown-body code,.markdown-body pre{font-family:Menlo,Monaco,Consolas,Courier New,monospace}.markdown-body pre{overflow:auto;position:relative;line-height:1.75}.markdown-body pre>code{font-size:12px;padding:15px 12px;margin:0;word-break:normal;display:block;overflow-x:auto;color:#333;background:#f8f8f8}.markdown-body a{text-decoration:none;color:#0269c8;border-bottom:1px solid #d1e9ff}.markdown-body a:active,.markdown-body a:hover{color:#275b8c}.markdown-body table{display:inline-block!important;font-size:12px;width:auto;max-width:100%;overflow:auto;border:1px solid #f6f6f6}.markdown-body thead{background:#f6f6f6;color:#000;text-align:left}.markdown-body tr:nth-child(2n){background-color:#fcfcfc}.markdown-body td,.markdown-body th{padding:12px 7px;line-height:24px}.markdown-body td{min-width:120px}.markdown-body blockquote{color:#666;padding:1px 23px;margin:22px 0;border-left:4px solid #cbcbcb;background-color:#f8f8f8}.markdown-body blockquote:after{display:block;content:""}.markdown-body blockquote>p{margin:10px 0}.markdown-body ol,.markdown-body ul{padding-left:28px}.markdown-body ol li,.markdown-body ul li{margin-bottom:0;list-style:inherit}.markdown-body ol li .task-list-item,.markdown-body ul li .task-list-item{list-style:none}.markdown-body ol li .task-list-item ol,.markdown-body ol li .task-list-item ul,.markdown-body ul li .task-list-item ol,.markdown-body ul li .task-list-item ul{margin-top:0}.markdown-body ol ol,.markdown-body ol ul,.markdown-body ul ol,.markdown-body ul ul{margin-top:3px}.markdown-body ol li{padding-left:6px}.markdown-body .contains-task-list{padding-left:0}.markdown-body .task-list-item{list-style:none}@media (max-width:720px){.markdown-body h1{font-size:24px}.markdown-body h2{font-size:20px}.markdown-body h3{font-size:18px}}.markdown-body pre,.markdown-body pre>code.hljs{color:#333;background:#f8f8f8}.hljs-comment,.hljs-quote{color:#998;font-style:italic}.hljs-keyword,.hljs-selector-tag,.hljs-subst{color:#333;font-weight:700}.hljs-literal,.hljs-number,.hljs-tag .hljs-attr,.hljs-template-variable,.hljs-variable{color:teal}.hljs-doctag,.hljs-string{color:#d14}.hljs-section,.hljs-selector-id,.hljs-title{color:#900;font-weight:700}.hljs-subst{font-weight:400}.hljs-class .hljs-title,.hljs-type{color:#458;font-weight:700}.hljs-attribute,.hljs-name,.hljs-tag{color:navy;font-weight:400}.hljs-link,.hljs-regexp{color:#009926}.hljs-bullet,.hljs-symbol{color:#990073}.hljs-built_in,.hljs-builtin-name{color:#0086b3}.hljs-meta{color:#999;font-weight:700}.hljs-deletion{background:#fdd}.hljs-addition{background:#dfd}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:700}
## Why Compostion-api？


我们以前是怎么写vue的？

上面是信息，下面是表格。



### options-api



```
import {getTableData,getInfo} from 'api/shuihu';
export default {
    data(){
        tableData:[],
        info:{
            name:'',
            organization:''
        },
        loading:false
    
    },
    created(){
        let p1=this.getTableData();
        let p2=this.getInfo();
        this.loading=true;
        Promise.all([p1,p2]).finally(()=>{
            this.loading=false;
        })
    },
    methods:{
        async getTableData(){
            const {data} = await getTableData();
            this.tableData=data;
        },
        async getInfo(){
            const {data} = await getInfo();
            this.info.name=data.name;
            this.info.organization=data.organization;
        },
    }
}
```


同一个功能，放在不同的地方。当代码量一大，维护一个功能，得上下来回跳，而且很难确定是否改全。这叫业务分散。维护起来很麻烦。



### composition-api


composition-api又叫组合式api，打破data和data放一起，methods和methods放一起这种组织方式，把不同的options(data、methods、computed、生命周期等)但同一个功能放一起。就像做菜一样，一道红烧肉需要大料酱油五花肉料酒放一起。当我发现味道不够咸，我再放点盐。这种组织方式，当我想维护一个功能时，直接一眼找到。因为可以注释，options-api你想注释还不好注释。



```
import {getTableData,getInfo} from 'api/shuihu';
import {ref,reactive} from '@vue/composition-api';
export default {
    setup(){
        //info
        const info=reactive({
            name:'',
            organization:''
        })
        const p1 = getInfo.then(({data})=>{
            info.name=data.name;
            info.organization=data.organization;
        })
    
        //table
        const tableData=ref([]);
        const p2 = getTableData().then(({data})=>{
            tableData.value=data;
        })
    
        //loading
        const loading=ref(true);
        Promise.all([p1,p2]).finally(()=>{
        loading.value=false
        })
        return {
            info,
            tableData,
            loading
        }
    }
}
```


这么写是不是一目了然，获取信息，表格，loading，获取信息想加东西，直接在这里去改



## options-api 与 composition-api常用语法上的不同




- data








- 所有的内容包在setup里面，在template使用的数据和方法需要return







## 使用组合式api的好处



### 1.按功能划分，便于维护



### 2.逻辑复用


我们按照功能来组织，打破options聚合在一起的方式，这就为逻辑复用提供可能。



## 如何封装一个逻辑函数


其实逻辑复用函数简单理解就是 有状态的函数


比函数多了状态，比组件少了视图。


useBoolean
例如这个弹窗表单，我们是不是得维护开启关闭visible这个逻辑、新增修改isAdd这个逻辑


原本我们需要这么写



```
data(){
    visible:false,
    isAdd:true
},
methods:{
    openDialog(){
        this.visible=true;
    },
    closeDialog(){
        this.visible=false
    },
    setAdd(){
        this.isAdd=true;
    },
    setEdit(){
        this.isAdd=false;
    }
}
```


现在我们这么写

简单明了





useAsync
每次进行接口请求，是不是定义data loading快吐了



```
this.loading=true;
...
this.loading=false
```


现在useAync内部直接帮你做，该loading展示时展示，该隐藏时隐藏，你只需要结构data和loading，挂到视图上就行








逻辑复用说白了就是封装一个响应式的函数，把会响应的data和methods丢给你，然后你去挂在视图上，该响应的时候自动响应。



## 总结


先不说逻辑复用不复用，options-api的写法，开发的时候有多爽，维护起来就有多惨，不信拿起一个月前自己写的500行以上的代码，都得看半天，看到颠掉。


以后开发的功能都用composition-api来写，你会感谢你自己