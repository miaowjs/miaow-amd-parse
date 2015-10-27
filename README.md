# miaow-amd-parse

> Miaow的AMD解析器, 可以补全模块名称和依赖的模块名称, 也可以将CSS和JSON转换成AMD模块. 依赖路径遵循喵呜的寻路规则

## 效果示例

```javascript
define(['jquery#ignore', './mock#debug', './style.css', './info.json', './template.tpl'], function($, mock, style, info, template) {
  // jquery 不会做寻路处理
  // 应用样式
  style.use();
  // 取消应用样式
  style.unuse();
  
  // JSON文件将被转换成简单对象引入
  console.log(info);
  
  // 模版会被转换成字符串
  $('#hello').html(template);
});
```

### 参数说明

#### debug
Type:`Boolean` Default:`false`

是否处于调试模式

如果处于非调试模式，那么所有添加`#debug`后缀的模块名，都讲被替换成空字符串
