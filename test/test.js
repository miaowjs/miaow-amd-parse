var assert = require('assert');
var fs = require('fs');
var miaow = require('miaow');
var path = require('path');

var parse = require('../index');
describe('正常模式', function () {
  this.timeout(10e3);

  var log;

  before(function (done) {
    miaow.compile({
      cwd: path.resolve(__dirname, './fixtures/normal'),
      output: path.resolve(__dirname, './output'),
      module: {
        tasks: [
          {
            test: /\.js$/,
            plugins: [parse]
          }
        ]
      }
    }, function (err) {
      if (err) {
        console.error(err.toString());
        process.exit(1);
      }
      log = JSON.parse(fs.readFileSync(path.resolve(__dirname, './output/miaow.log.json')));
      done();
    });
  });

  it('接口是否存在', function () {
    assert(!!parse);
  });

  it('添加模块标识', function () {
    assert.equal(log.modules['id.js'].hash, '974e56c8cc6bfdd66513d0c35f4234ec');
  });

  it('获取依赖', function () {
    var dependList = log.modules['depend.js'].dependList;

    assert.equal(dependList[0], 'id.js');
    assert.equal(dependList[1], 'bower_components/foo.js');
    assert.equal(dependList[2], 'bower_components/bar/main.js');
    assert.equal(dependList[3], 'bower_components/bar/lib/baz.js');
    assert.equal(dependList[4], 'info.json');
    assert.equal(dependList[5], 'style.css');
    assert.equal(dependList[6], 'img.png');

    dependList = log.modules['require.js'].dependList;
    assert.equal(dependList[0], 'depend.js');
    assert.equal(dependList[1], 'img.png');
    assert.equal(dependList[2], 'style.css');
    assert.equal(dependList[3], 'info.json');
  });

  it('修改依赖路径', function () {
    assert.equal(log.modules['depend.js'].hash, '4b82a9fb2ad3e7e4e0c4fd1ca228c4b9');
    assert.equal(log.modules['require.js'].hash, '24764a9a1cc62d4681a25094b938e07e');
  });

  it('忽略模块', function () {
    assert.equal(log.modules['ignore.js'].hash, 'e2cc6099718cbaa0bc2506fb2dc37e00');
  });
});
