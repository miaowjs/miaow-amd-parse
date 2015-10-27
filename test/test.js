var _ = require('lodash');
var assert = require('assert');
var fs = require('fs');
var miaow = require('miaow');
var path = require('path');

var parse = require('../index');
describe('正常模式', function() {
  this.timeout(10e3);

  var log;

  before(function(done) {
    miaow({
      context: path.resolve(__dirname, './fixtures')
    }, function(err) {
      if (err) {
        console.error(err.toString(), err.stack);
        process.exit(1);
      }

      log = JSON.parse(fs.readFileSync(path.resolve(__dirname, './output/miaow.log.json')));
      done();
    });
  });

  it('接口是否存在', function() {
    assert(!!parse);
  });

  it('处理AMD模块', function() {
    assert.equal(_.find(log.modules, {src: 'define.js'}).destHash, '2bce6a0896aeffe2f3bcc2758683c668');
    assert.equal(_.find(log.modules, {src: 'require.js'}).destHash, 'e87d26bdab12ec5f514f7c972c9ff97b');
  });

  it('加载其他类型模块', function() {
    assert.equal(_.find(log.modules, {src: 'loader.js'}).destHash, 'e7d4aea93311cf1bccae71474464fd92');
  });

  it('调试模式', function() {
    assert.equal(_.find(log.modules, {src: 'debug.js'}).destHash, '2411230f63ea36dae6f4753ad14c47cd');
  });

  it('第三方代码', function() {
    assert.equal(_.find(log.modules, {src: 'thirdparty.js'}).destHash, 'c83ad1e0a04322f243854c49fa52d21c');
  });
});
