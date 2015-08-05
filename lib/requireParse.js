var async = require('async');
var mutil = require('miaow-util');
var recast = require('recast');

var isIgnore = require('./isIgnore');
var getRelativeId = require('./getRelativeId');

function requireParse(option, ast, cb) {
  var types = recast.types;
  var n = types.namedTypes;
  var requireNodes = [];
  var root = option.root || this.output;
  var ignore = option.ignore || [];

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

  // 获取依赖的模块路径Node
  var dependedModuleNodeList = Array.prototype.concat.apply(
    [],
    requireNodes.map(function (node) {
      var arg = node.arguments[0];

      if (n.Literal.check(arg)) {
        return arg;
      } else if (n.ArrayExpression.check(arg)) {
        return arg.elements;
      }
    })
  );

  var module = this;
  async.eachSeries(
    dependedModuleNodeList,
    function (node, cb) {
      var id = node.value.replace(/\#pack$/, '');
      if (isIgnore(id, ignore)) {
        return cb();
      }

      // 修改依赖路径
      module.getModule(id, function (err, dependedModule) {
        if (err) {
          if (!(err.plugin)) {
            err = new mutil.PluginError(require('../index').toString(), err, {
              fileName: module.srcAbsPath,
              lineNumber: node.loc.start.line
            });
          }

          return cb(err);
        }

        // 如果需要打包
        if (option.pack && (/\#pack$/.test(node.value) || (module.packed && !dependedModule.packed))) {
          module.packedModules = module.packedModules.concat(dependedModule.packedModules, dependedModule.srcPath);
        }

        node.value = getRelativeId(root, dependedModule);

        cb();
      });
    },
    cb
  );
}

module.exports = requireParse;
