var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var mutil = require('miaow-util');
var path = require('path');
var recast = require('recast');
var uniq = require('lodash').uniq;

var defineParse = require('./lib/defineParse');
var requireParse = require('./lib/requireParse');
var pkg = require('./package.json');

// 查看是否是某个包的主入口
function isPackageMain(filePath, root) {
  var searchDir = path.dirname(filePath);
  var relative = mutil.relative(root, searchDir);

  function detectMain(searchDir, mainList) {
    return !!_.find(mainList, function (main) {
      return path.join(searchDir, main) === filePath;
    });
  }

  // 逐级向上查找package.json, 并判断package.json里面的main信息是否指向这个文件地址
  do {
    var mainList = [];

    var pkgFile = path.join(searchDir, 'package.json');
    if (fs.existsSync(pkgFile)) {
      var pkg = JSON.parse(fs.readFileSync(pkgFile, {encoding: 'utf8'}));

      if (pkg.main) {
        mainList = mainList.concat(pkg.main);
      }

      if (pkg.packMain) {
        mainList = mainList.concat(pkg.packMain);
      }
    }

    if (detectMain(searchDir, mainList)) {
      return true;
    }

    searchDir = path.resolve(searchDir, '..');
    relative = mutil.relative(root, searchDir);
  } while (!/^\.\./.test(relative));

  return false;
}

function parse(option, cb) {
  var contents = this.contents.toString();

  if (!contents.trim()) {
    return cb();
  }

  var ast = recast.parse(contents);

  // 是否需要打包
  this.packed = isPackageMain(this.srcAbsPath, this.cwd);

  var module = this;

  async.parallel([
    requireParse.bind(this, option, ast),
    defineParse.bind(this, option, ast)
  ], function (err) {
    if (err) {
      return cb(err);
    }

    module.packedModules = uniq(module.packedModules);

    if (module.packedModules.length) {
      module.packed = true;
    }

    // 修改模块ID, 并合并文件
    module.contents = new Buffer(recast.print(ast).code);
    cb();
  });
}

module.exports = mutil.plugin(pkg.name, pkg.version, parse);

