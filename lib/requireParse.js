var async = require('async');
var mutil = require('miaow-util');
var path = require('path');
var recast = require('recast');

var pkg = require('../package.json');

function requireParse(option, ast, cb) {
  var types = recast.types;
  var n = types.namedTypes;
  var requireNodes = [];
  var root = option.root || this.output;

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
      // 修改依赖路径
      module.getModule(node.value.replace(/\#pack$/, ''), function (err, dependedModule) {
        if (err) {
          if (!(err instanceof mutil.PluginError)) {
            err = new mutil.PluginError(pkg.name, err, {
              fileName: module.srcAbsPath,
              lineNumber: node.loc.start.line,
              showStack: true
            });
          }

          return cb(err);
        }

        // 添加依赖信息
        module.dependencies.push(dependedModule.srcPath);

        // 如果需要打包
        if (option.pack && (/\#pack$/.test(node.value) || (module.packed && !dependedModule.packed))) {
          module.packedModules = module.packedModules.concat(dependedModule.packedModules, dependedModule.srcPath);
        }

        node.value = dependedModule.url || path.relative(root, dependedModule.destAbsPathWithHash);
        cb();
      });
    },
    cb
  );
}

module.exports = requireParse;
