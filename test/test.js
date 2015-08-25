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
    assert.equal(log.modules['id.js'].hash, '7260b57cf7b6579236438e71d6bec9cf');
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
    assert.equal(log.modules['depend.js'].hash, '5d5eeabc2677c6b8d8fab99d4a5942cb');
    assert.equal(log.modules['require.js'].hash, '2d741fbd4b66bd32723a214b2dbcd4bf');
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
                pack: true,
                ignore: ['jquery']
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
    var packList = log.modules['main.js'].packList;

    assert.equal(packList.indexOf('bower_components/bar/main.js'), -1);
    assert.equal(packList.indexOf('bower_components/bar/other.js'), -1);
    assert.equal(packList[0], 'bower_components/foo.js');
    assert.equal(packList[1], 'bower_components/bar/lib/baz.js');
  });

  it('强制打包', function () {
    var packList = log.modules['force.js'].packList;

    assert.equal(packList.indexOf('jquery'), -1);
    assert.equal(packList[0], 'bower_components/foo.js');
    assert.equal(packList[1], 'bower_components/bar/main.js');
  });
});
