var _ = require('lodash');
var async = require('async');
var recast = require('recast');

var getIdInfo = require('./getIdInfo');
var loader = require('./loader');

function requireParse(context, options, ast, callback) {
  var types = recast.types;
  var namedTypes = types.namedTypes;
  var requireNodes = [];

  var noConditionRequire = _.find(ast.program.body || [], function(child) {
    return namedTypes.ExpressionStatement.check(child) &&
      namedTypes.CallExpression.check(child.expression) &&
      namedTypes.Identifier.check(child.expression.callee) &&
      child.expression.callee.name === 'require' &&
      namedTypes.ArrayExpression.check(child.expression.arguments[0]);
  });

  var noConditionDependNodes = [];

  if (noConditionRequire) {
    noConditionDependNodes = noConditionRequire.expression.arguments[0].elements;
  }

  // 查出所有的 require 语句
  types.visit(ast, {
    visitCallExpression: function(path) {
      if (
        namedTypes.Identifier.check(path.node.callee) &&
        path.node.callee.name === 'require'
      ) {
        requireNodes.push(path.node);
      }

      this.traverse(path);
    }
  });

  // 获取依赖的模块路径Node
  var dependedModuleNodeList = Array.prototype.concat.apply(
    [],
    requireNodes.map(function(node) {
      var arg = node.arguments[0];

      if (namedTypes.Literal.check(arg)) {
        return arg;
      } else if (namedTypes.ArrayExpression.check(arg)) {
        return arg.elements;
      }
    })
  );

  async.eachSeries(
    dependedModuleNodeList,
    function(node, callback) {
      var idInfo = getIdInfo(node.value);

      node.value = idInfo.id;

      // 调试用的模块
      if (idInfo.debug && !options.debug) {
        node.value = '';
        return callback();
      }

      if (['require', 'module', 'exports'].indexOf(idInfo.id) !== -1) {
        return callback();
      }

      // 修改依赖路径
      loader(context, idInfo, function(err, module) {
        if (err) {
          return callback(err);
        }

        var src;

        if (_.isString(module)) {
          node.value = idInfo.id;

          src = module;
        } else {
          node.value = module.url;

          src = module.src;
        }

        if (noConditionDependNodes.indexOf(node) !== -1) {
          context.extra.AMDDependencies.push(src);
        }

        callback();
      });
    },

    callback
  );
}

module.exports = requireParse;
