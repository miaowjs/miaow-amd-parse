var async = require('async');
var recast = require('recast');

var getIdInfo = require('./getIdInfo');
var getRelativeId = require('./getRelativeId');
var isIgnore = require('./isIgnore');
var loader = require('./loader');

function requireParse(option, ast, cb) {
  var types = recast.types;
  var n = types.namedTypes;
  var requireNodes = [];
  var ignore = option.ignore || [];

  ignore.push('require', 'module', 'exports');

  // 查出所有的 require 语句
  types.visit(ast, {
    visitCallExpression: function (path) {
      var node = path.node;

      if (
        n.Identifier.check(node.callee) &&
        node.callee.name === 'require'
      ) {
        requireNodes.push(node);
      }

      this.traverse(path);
    }
  });

  var defaultNotPackNodes = [];

  // 获取依赖的模块路径Node
  var dependedModuleNodeList = Array.prototype.concat.apply(
    [],
    requireNodes.map(function (node) {
      var arg = node.arguments[0];

      if (n.Literal.check(arg)) {
        return arg;
      } else if (n.ArrayExpression.check(arg)) {
        defaultNotPackNodes = defaultNotPackNodes.concat(arg.elements);
        return arg.elements;
      }
    })
  );

  var module = this;
  async.eachSeries(
    dependedModuleNodeList,
    function (node, cb) {
      var idInfo = getIdInfo(node.value);
      var id = idInfo.id;
      var idOption = idInfo.option;

      node.value = id;

      if (idOption.ignore || isIgnore(id, ignore)) {
        return cb();
      }

      // 修改依赖路径
      loader(module, idInfo, function (err, dependedModule) {
        if (err) {
          return cb(err);
        }

        node.value = getRelativeId(dependedModule);

        cb();
      });
    },
    cb
  );
}

module.exports = requireParse;
