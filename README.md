# miaow-amd-parse

> Miaow的AMD解析器, 可以获取AMD模块的依赖, 并可以补全模块标识和依赖路径

```javascript
define(['bar', './foo/foo', 'fob'], function (bar, foo) {
  return 'baz';
});

/* 处理后 */
define(
  "baz_5c8a6eb6cb.js",
  ["bower_components/bar_7ebfec5ba6.js", "foo/foo_4f4b0becb5.js", "bower_components/fob/index_df40670d34.js"],
  function (bar, foo) {
    return 'baz';
  }
);
```

## 使用说明

### 安装

```
npm install miaow-amd-parse --save-dev
```

### 在项目的 miaow.config.js 中添加模块的 parse 设置

```javascript
//miaow.config.js
module: {
  parse: [
    {
      test: /\.js$/,
      plugins: ['miaow-amd-parse']
    }
  ]
}
```
