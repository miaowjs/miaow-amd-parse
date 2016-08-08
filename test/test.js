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
    assert.equal(_.find(log.modules, {src: 'define.js'}).destHash, '19902fcfb36509bdf56c8395ff2b651f');
    assert.equal(_.find(log.modules, {src: 'require.js'}).destHash, 'e87d26bdab12ec5f514f7c972c9ff97b');
  });

  it('加载其他类型模块', function() {
    assert.equal(_.find(log.modules, {src: 'loader.js'}).destHash, 'dc18e113dc25dc5b6b93de77964c42af');
  });

  it('调试模式', function() {
    assert.equal(_.find(log.modules, {src: 'debug.js'}).destHash, '2411230f63ea36dae6f4753ad14c47cd');
  });

  it('第三方代码', function() {
    assert.equal(_.find(log.modules, {src: 'thirdparty.js'}).destHash, '8aca4420f46eab1e841a93bcee3ad153');
  });

  it('依赖远程代码', function() {
    assert.equal(_.find(log.modules, {src: 'url.js'}).destHash, '844a3648fe043ef860bf616e6bbb4050');
  });
});
