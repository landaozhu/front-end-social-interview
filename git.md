## cherry pick
背景：本来应该在branch1 comomit 结果你在branch2直接commit，那想要把这些东西搬到branch1就会很麻烦，所以直接把1或者多个commit内容放到branch1上，于是
```bash
git checkout branch1
git cherry-pick <commit id>
```
### 语法
```bash
git cherry-pick <commit id>
git cherry-pick <commit id1> <commit id2>
git cherry-pick <commit id1>...<commit id8>
#2-8的commit全部复制过来（开区间）
git cherry-pick <commit id1>^...<commit id8>
#1-8的commit全部复制过来（闭区间）
```
这样这一个或者多个commit就会被复制到branch1上
### 解决cherry-pick造成的冲突
```bash
git add git cherry-pick --continue#1 继续
git cherry-pick --abort#2 回滚 
git cherry-pick --quit#3 中断（不咋用）
```
## stash
当你在本地有文件变动，又想直接pull，是不会成功的，如果说你本身不希望这些变动直接commit，那么可以先保存起来。用stash，这个是一个栈，先把变动代码保存在栈里面，等pull之后再取出来，继续修改。
### 使用
- 存栈
git stash
git stash name(注释)
- 出栈
git stash pop(出栈顶)
git stash apply(不出栈 peek)
- 清除
git stash drop 索引
git stash clear
- 查看
git stash list
git stash show 索引
## rebase
相比git merge，rebase会很干净，比如说原来merge，出现冲突，解决merge完之后 修改人的名字变成你的，这样就很难去追踪到底是谁的代码。merge之后这条分支记录还在，但是rebase完就相当于没有这个分支了。
develop #开发分支
master #主分支，并且有新代码
```bash
git checkout develop
git rebase master
git rebase --continue#出现冲突
```
## diff
查看区别

![截屏2023-09-09 上午1.38.38.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9ad832f0a7bd4cd886659e4476f69070~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=513&h=339&s=184481&e=png&b=5a92a6)
git diff A...B
比较3和8的区别
git diff A..B
比较7 和 8的区别
## log
查看日志
![截屏2023-09-09 上午1.44.37.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/335d843f518e45efb793e0961b3bdbfb~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=491&h=329&s=178385&e=png&b=5a8fa6)
git log A..B
查看 4 6 8
git log A...B
查看 5 7 、4 6 8

## fetch
> - git remote show origin查看本地是否落后于远程


### 语法
git fetch [远程] # 拉取全部
git fetch 远程 分支  # 拉取分支
## pull
git pull=git fetch+git merge
git pull [远程] #拉取全部并合并
git pull 远程 分支 #拉取分支并合并
## push
Git branch --set-upstream是Git branch命令的一种扩展形式，可以将本地分支与远程分支进行关联。

在进行Git push操作时，如果本地分支与远程分支未进行过关联，则需要在Git push时指定远程分支
## 参考
- [叼烟写单测 git合集](https://www.bilibili.com/video/BV1Yd4y1v7ab/?spm_id_from=333.788&vd_source=1717bca8aebff18ca2591bd114c54e3f)
- [【搞笑Git教程】15 git pull和git fetch | 一套带走 快速上手 保姆级 | 持续更新](https://www.bilibili.com/video/BV1E3411c7cb/?spm_id_from=333.337.search-card.all.click&vd_source=1717bca8aebff18ca2591bd114c54e3f)
- [【B站最全Git进阶课程】git rebase: 人生无法重来，但代码可以！](https://www.bilibili.com/video/BV1Xb4y1773F/?spm_id_from=333.337.search-card.all.click&vd_source=1717bca8aebff18ca2591bd114c54e3f)
- [Git Branch --set-upstream详解](https://www.python100.com/html/31R2AFJ7FV96.html)