var async = require('async');
var mutil = require('miaow-util');
var recast = require('recast');

var defineParse = require('./lib/defineParse');
var requireParse = require('./lib/requireParse');
var pkg = require('./package.json');

function parse(option, cb) {
  var contents = this.contents.toString();

  if (!contents.trim()) {
    return cb();
  }

  try {
    var ast = recast.parse(contents);
  } catch (err) {
    return cb(err);
  }

  var module = this;

  async.parallel([
    requireParse.bind(this, option, ast),
    defineParse.bind(this, option, ast)
  ], function (err) {
    if (err) {
      return cb(err);
    }

    // 修改模块ID, 并合并文件
    try {
      module.contents = new Buffer(recast.prettyPrint(ast, {tabWidth: 2}).code);
    } catch (err) {
      return cb(err);
    }

    cb();
  });
}

module.exports = mutil.plugin(pkg.name, pkg.version, parse);

