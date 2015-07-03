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
      pack: false,
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
    assert.equal(log.modules['id.js'].hash, '9ff069af1a8a8e34353f81367f4f3b06');
  });

  it('获取依赖', function () {
    var dependencies = log.modules['depend.js'].dependencies;

    assert.equal(dependencies[0], 'id.js');
    assert.equal(dependencies[1], 'bower_components/foo.js');
    assert.equal(dependencies[2], 'bower_components/bar/main.js');
    assert.equal(dependencies[3], 'bower_components/bar/lib/baz.js');
  });

  it('修改依赖路径', function () {
    assert.equal(log.modules['require.js'].hash, '111a18566d19de0f01bab31eab175ce3');
  });
});

describe('打包模式', function () {
  this.timeout(10e3);

  var log;

  before(function (done) {
    miaow.compile({
      cwd: path.resolve(__dirname, './fixtures/pack'),
      output: path.resolve(__dirname, './output'),
      pack: false,
      module: {
        tasks: [
          {
            test: /\.js$/,
            plugins: [{
              plugin: parse,
              option: {
                pack: true
              }
            }]
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

  it('包主入口打包', function () {
    var packedModules = log.modules['main.js'].packedModules;

    assert.equal(packedModules[0], 'bower_components/foo.js');
    assert.equal(packedModules[1], 'bower_components/bar/lib/baz.js');
  });

  it('强制打包', function () {
    var packedModules = log.modules['force.js'].packedModules;

    assert.equal(packedModules[0], 'bower_components/foo.js');
    assert.equal(packedModules[1], 'bower_components/bar/lib/baz.js');
    assert.equal(packedModules[2], 'bower_components/bar/main.js');
  });
});
