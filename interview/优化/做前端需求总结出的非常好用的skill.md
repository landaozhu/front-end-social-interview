# 做前端需求总结出的非常好用的skill

> 来源: https://juejin.cn/post/7631384678335971391

> 在开发中多去拆分步骤，SOP化，拆成一个一个小skill，有助于帮助自己处理一些比较繁琐的任务



### 代码梳理


这是一个非常屌的代码梳理技能，可以帮助你在调研阶段快速了解代码逻辑
会从页面、逻辑两个角度，从宏观到局部




- 例如筛选块、表格，然后比如说操作栏里面编辑按钮展示逻辑，都会梳理清楚

- 如果是复杂逻辑会放在逻辑里面

- 如果你们项目里面有某个文件专门放接口，像我们项目是service/index.js；这个技能会梳理出调用这个接口所有的入参出参，中文意思




### 找出页面入口


这个在梳理影响范围的非常好用，比如说修改公共组件，梳理影响范围的时候就可以找到所有使用公共组件的业务组件，再用这个skill找到页面入口，可以直接贴在文档让测试看，自己在页面进行点击找起来也相当方便


这个我在做上传迁移的时候总结的，这个上传迁移是为了迁移存放文件、图片的云地址，为了更加安全，因此大概有涉及20个组件要做迁移，并且每个组件可能在多个业务中去应用，因此需要整了大概40个入口给到测试，后来在梳理某个接口的前端逻辑，也用到这个技能，非常好用



### 自我review


这个可以在每次提交前过一遍，如果平时自己开发容易有某一类bug也可以加上去，原先我是人工按照这些review点一个一个人工审查，现在有了ai，就可以让ai按照这些点一个一个过，大大提高了代码质量、降低bug数



## 业务梳理


这个是可以帮助你了解你到底做了什么，很多时候初级甚至三五年前端，开发完不知道自己做了什么业务，了解起来非常痛苦，那么这个技能会输出一篇你开发代码相关的业务逻辑，一看就非常了解



## github地址


> 为了大家更好的使用这些skills，我写了个业务skills和rules的仓库，后续陆续更新
[github.com/landaozhu/s…](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Flandaozhu%2Fskills)



### README



#### rules规则（强约束）


[](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Flandaozhu%2Fskills%23rules%25E8%25A7%2584%25E5%2588%2599%25E5%25BC%25BA%25E7%25BA%25A6%25E6%259D%259F)




- frontend-dev-strict-scope-and-check: 前端项目约束（Vue、React等）

- umi：umi项目

- egg: egg项目




#### skills


[](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Flandaozhu%2Fskills%23skills)


> 技能，给agent的说明书




- commit-pre-check（review代码，给出错误报告）

- deal-with-code-to-fontend-logic（把代码梳理成中文逻辑，帮助开发者更快理解逻辑）

- debug-console-only(调试代码，人工执行并贴给agent报错信息，直到找到bug，最后删除调试代码)

- generate-business-docs-from-code（业务梳理，让你快速了解所做需求的业务）

- review-commit-push（提交代码，提交前通过commit-pre-check检查，没问题提交）

- find-component-entry（通过.vue/.jsx文件，找到页面入口，在梳理大范围改动的时候特别有用）