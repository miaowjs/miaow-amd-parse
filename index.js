var _ = require('lodash');
var async = require('async');
var recast = require('recast');

var defineParse = require('./lib/defineParse');
var requireParse = require('./lib/requireParse');
var pkg = require('./package.json');

module.exports = function(options, callback) {
  var context = this;
  var contents = context.contents.toString();

  if (!contents.trim()) {
    return callback();
  }

  var ast;
  try {
    ast = recast.parse(contents);
  } catch (err) {
    return callback(err);
  }

  // 设置AMD依赖
  context.extra.AMDDependencies = context.extra.AMDDependencies || [];

  async.parallel([
    _.partial(requireParse, context, options, ast),
    _.partial(defineParse, context, options, ast)
  ], function(err) {
    if (err) {
      return callback(err);
    }

    try {
      context.contents = new Buffer(recast.print(ast).code);
    } catch (err) {
      return callback(err);
    }

    callback();
  });
};

module.exports.toString = function() {
  return [pkg.name, pkg.version].join('@');
};

