var async = require('async');
var mutil = require('miaow-util');
var recast = require('recast');

var isIgnore = require('./isIgnore');
var getRelativeId = require('./getRelativeId');

function defineParse(option, ast, cb) {
  var types = recast.types;
  var n = types.namedTypes;
  var defineNode;
  var root = option.root || this.output;
  var ignore = option.ignore || [];

  // 查询define语句
  types.visit(ast, {
    visitCallExpression: function (path) {
      var node = path.node;

      if (
        n.Identifier.check(node.callee) &&
        node.callee.name === 'define'
      ) {
        defineNode = node;
      }

      this.traverse(path);
    }
  });

  // 如果没有查到define语句
  if (!defineNode) {
    return cb();
  }

  var args = defineNode.arguments;
  var idNode;
  var dependenciesNode = {elements: []};

  // 获取模块标识
  if (args.length > 1 && n.Literal.check(args[0])) {
    idNode = args[0];

    args = args.slice(1);
  }

  // 获取依赖
  if (args.length > 1 && n.ArrayExpression.check(args[0])) {
    dependenciesNode = args[0];

    args = args.slice(1);
  }

  var module = this;
  async.eachSeries(
    dependenciesNode.elements,
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
    function (err) {
      if (err) {
        return cb(err);
      }

      module.hash = mutil.hash(new Buffer(recast.print(ast).code));

      var id = getRelativeId(root, module);
      var b = types.builders;

      // 设置模块ID
      if (!idNode) {
        idNode = b.literal(id);
        defineNode.arguments.unshift(idNode);
      } else {
        idNode.value = id;
      }

      cb();
    }
  );
}

module.exports = defineParse;
