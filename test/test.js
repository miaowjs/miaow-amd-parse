var assert = require('assert');
var fs = require('fs');
var miaow = require('miaow');
var path = require('path');

var parse = require('../index');
describe('miaow-amd-parse', function () {
  this.timeout(10e3);

  var log;

  before(function (done) {
    miaow.compile({
      cwd: path.resolve(__dirname, './fixtures'),
      output: path.resolve(__dirname, './output'),
      pack: false,
      module: {
        tasks: [
          {
            test: /\.js$/,
            plugins: [
              {
                plugin: parse,
                option: {
                  amdWrap: true
                }
              }
            ]
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
    assert.equal(log.modules['bas.js'].hash, '8442622a96807a15abec5d981f48dbfe');
  });

  it('获取依赖', function () {
    var dependencies = log.modules['baz.js'].dependencies;

    assert.equal(dependencies[0], 'bower_components/bar.js');
    assert.equal(dependencies[1], 'foo/foo.js');
    assert.equal(dependencies[2], 'bower_components/fob/index.js');
  });

  it('修改依赖路径', function () {
    assert.equal(log.modules['baz.js'].hash, '56b14bb42b3eb490088a92fb3ebcc9b1');
  });
});
