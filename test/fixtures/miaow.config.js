var parse = require('../..');
var path = require('path');

module.exports = {
  // 工作目录
  context: __dirname,

  // 输出目录
  output: path.resolve(__dirname, '../output'),

  // 缓存目录
  cache: '',

  // 静态文件的域名
  domain: 'http://127.0.0.1',

  // 模块编译设置
  modules: [
    {
      test: '*.js',
      tasks: [parse]
    }
  ]
};
