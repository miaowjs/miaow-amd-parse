# miaow-amd-parse

> Miaow的AMD解析器, 可以补全模块名称和依赖的模块名称, 也可以将CSS和JSON转换成AMD模块. 依赖路径遵循喵呜的寻路规则

## 效果示例

```javascript
define(['foo', './style.css', './info.json'], function (foo, style, info) {
  // 调用样式模块的use方法即可使用样式, 调用unuse方法取消使用
  style.use();
  // JSON文件将被转换成简单对象引入
  console.log(info);
});

/* 处理后 */
define(
  "baz_5c8a6eb6cb",
  ["bower_components/bar_7ebfec5ba6", "style.css_4f4b0becb5", "info.json_df40670d34"],
  function (bar, foo) {
    return 'baz';
  }
);
```

### 参数说明

#### pack
Type:`Boolean` Default:`false`

是否进行打包操作

当一个模块被指定为打包主入口的时候, 会将它静态依赖的非打包主入口的模块合并进自己, 可以通过 `package.json` 里面的 `main` 和 `extraMain` 指定打包主入口.

如果在 `define` 或 `require` 表达式中指定依赖时使用 `#pack` 参数, 那就忽略上述规则, 强制将对应的模块合并进自己, 比如 `require('foo#pack')` .
#### ignore
Type:`Array` Default:`undefined`

用于排除寻路的模块名列表, 可以包含字符串和正则表达式, 比如`['jquery']`
