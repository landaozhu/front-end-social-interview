## 基本概念
采用flex布局的元素，称为flex容器，子元素自动成为容器成员，称为flex项目
容器默认两根轴，主轴和副轴。
## 容器属性
- flex-direction(row|row-reserve|column|column-reverse)[默认row]
- flex-wrap(nowrap|wrap|wrap-reverse)[默认nowrap]
- flex-flow <flex-direction> <flex-wrap>[默认 row no-wrap]
- justify-content(flex-star|flex-end|center|space-between|space-around)
- align-items(flex-star|flex-end|center|baseline|stretch) 
- align-content(flex-start|flex-end|center|space-between|space-around|stretch)
## 项目属性
- order 默认0 数值越小越靠前，可以是负数
- flex-grow 定义项目的放大比例
- flex-shrink 定义项目的缩小比例
- flex-basis 项目占据主轴的空间
- flex flex-grow flex shrink 和flex-basis简写
- align-self 单独的对齐方式（auto | flex-start | flex-end | center | baseline | stretch）
- [语法](https://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)
- [练习题](https://www.ruanyifeng.com/blog/2015/07/flex-examples.html)
