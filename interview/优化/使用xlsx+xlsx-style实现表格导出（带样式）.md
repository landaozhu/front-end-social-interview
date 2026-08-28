# 使用xlsx+xlsx-style实现表格导出（带样式）

> 来源: https://juejin.cn/post/7327836344037785652

![截屏2024-01-25 20.07.36.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a6cc9f54efd473489932cbcbccfcd4a~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp#?w=1614&h=396&s=69418&e=png&b=ffffff)

为了通过纯前端代码实现带有样式的excel导出。这里用到xlsx（SheetJs）+xlsx-style。因为xlsx不能实现样式。


由于xlsx-style是node环境，且多年未维护，前端会报错，并且很多文章都是通过改库的代码实现兼容，我这里选择下载解决了xlsx-style问题的一个库：xlsx-style-medalsoft。



## 具体代码


我这边是react项目，不过代码都跟react不相关，只是作为一个工具函数
excel.js



```hljs jsx code-block-extension-codeShowNum
import { utils } from 'xlsx/xlsx.js'//因为我这里光引入xlsx会识别不了，大家看情况导入
import XLSX_STYLE from 'xlsx-style-medalsoft'

export function jsonToExcel(options = {}) {
  const { rows, name } = options
  const worksheet = utils.json_to_sheet(rows)
  /* 设置样式 */
  Object.keys(worksheet).forEach(key => {
    if (['A1', 'B1', 'C1'].includes(key)) {
      worksheet[key].s = {
        alignment: { horizontal: 'center' },
        font: {
          color: { rgb: 'FFFFFF' },
        },
        fill: {
          fgColor: { rgb: '4472C4' },
        },
      }
    }
  })
  // 设置宽度，只需要xlsx
  worksheet['!cols'] = [{ wpx: 100 }, { wpx: 400 }, { wpx: 100 }]
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'Dates')
  downloadExcel(sheet2blob(worksheet), `${name}.xlsx`) // 下载
}
function sheet2blob(sheet, sheetName = 'sheet1') {
  const workbook = {
    SheetNames: [sheetName],
    Sheets: {},
  }
  workbook.Sheets[sheetName] = sheet // 生成excel的配置项

  const wopts = {
    bookType: 'xlsx', // 要生成的文件类型
    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    type: 'binary',
  }
  const wbout = XLSX_STYLE.write(workbook, wopts)
  const blob = new Blob([s2ab(wbout)], {
    type: 'application/octet-stream',
  }) // 字符串转ArrayBuffer
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length)
    const view = new Uint8Array(buf)
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
    return buf
  }
  return blob
}

function downloadExcel(url, saveName) {
  let myUrl = url
  if (typeof url === 'object' && url instanceof Blob) {
    myUrl = URL.createObjectURL(url) // 创建blob地址
  }
  const aLink = document.createElement('a')
  aLink.href = myUrl
  aLink.download = saveName || '' // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
  let event
  if (window.MouseEvent) event = new MouseEvent('click')
  else {
    event = document.createEvent('MouseEvents')
    event.initMouseEvent(
      'click',
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    )
  }
  aLink.dispatchEvent(event)
}
```


调用



```hljs css code-block-extension-codeShowNum
const rows = [      {        xxx: '',      },      {        'yyy': '',      },      {        'ccc': ''      }    ]

    jsonToExcel({
      rows,
      name: '模版',
    })
```



## 参考




- [xlsx-style文档学习](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fxlsx-style)

- [学习如何写xlsx-style](https://link.juejin.cn/?target=https%3A%2F%2Fblog.csdn.net%2Fyehaocheng520%2Farticle%2Fdetails%2F123641456)

- [解决xlsx-style问题](https://link.juejin.cn/?target=http%3A%2F%2Fwww.zlprogram.com%2FShow%2F12%2F966522EE.shtml)

- [导出参考的代码](https://link.juejin.cn/?target=https%3A%2F%2Fzhuanlan.zhihu.com%2Fp%2F338935767%3Futm_id%3D0%26wd%3D%26eqid%3Dd71f7eb70000a8f900000005648978be)