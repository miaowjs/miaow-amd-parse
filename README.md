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

### 在项目的 miaow.config.js 中添加模块的 tasks 设置

```javascript
//miaow.config.js
module: {
  tasks: [
    {
      test: /\.js$/,
      plugins: ['miaow-amd-parse']
    }
  ]
}
```

### 参数说明

* pack 默认为`false`, 这个参数用于设置是否打包的. 
这里的打包逻辑是`package.json`中得`main`指定的主入口会打包`define`中声明的依赖.
否则不会打包, 除非在`define`或`require`中指定依赖时使用`#pack`参数, 比如`require('foo#pack')`
* ignore 默认为`undefined`, 用于排除寻路的模块名列表, 可以包含字符串和正则表达式, 比如`[jquery]`
