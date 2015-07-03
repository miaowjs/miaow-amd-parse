var async = require('async');
var fs = require('fs');
var path = require('path');
var recast = require('recast');
var uniq = require('lodash.uniq');

var defineParse = require('./lib/defineParse');
var requireParse = require('./lib/requireParse');

// 查看是否是某个包的主入口
function isPackageMain(filePath, root) {
  var searchDir = path.dirname(filePath);
  var relative = path.relative(root, searchDir);

  // 逐级向上查找package.json, 并判断package.json里面的main信息是否指向这个文件地址
  do {
    var filenameList = fs.readdirSync(searchDir);

    if (filenameList.indexOf('package.json') !== -1) {
      var pkgInfo = JSON.parse(fs.readFileSync(path.join(searchDir, 'package.json'), {encoding: 'utf8'}));

      if (pkgInfo.main && path.join(searchDir, pkgInfo.main) === filePath) {
        return true;
      }
    }

    searchDir = path.resolve(searchDir, '..');
    relative = path.relative(root, searchDir);
  } while (!/^\.\./.test(relative));

  return false;
}

module.exports = function (option, cb) {
  var ast = recast.parse(this.contents.toString());

  // 是否需要打包
  this.packed = isPackageMain(this.srcAbsPath, this.cwd);

  var module = this;

  async.parallel([
    requireParse.bind(this, option, ast),
    defineParse.bind(this, option, ast)
  ], function (err) {
    if (err) {
      return cb();
    }

    module.dependencies = uniq(module.dependencies);
    module.packedModules = uniq(module.packedModules);

    if (module.packedModules.length) {
      module.packed = true;
    }

    // 修改模块ID, 并合并文件
    module.contents = new Buffer(recast.print(ast).code);
    cb();
  });
};
