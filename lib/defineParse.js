var async = require('async');
var recast = require('recast');

var getIdInfo = require('./getIdInfo');
var getRelativeId = require('./getRelativeId');
var isIgnore = require('./isIgnore');
var loader = require('./loader');

function defineParse(option, ast, cb) {
  var types = recast.types;
  var n = types.namedTypes;
  var defineNode;
  var ignore = option.ignore || [];

  ignore.push('require', 'module', 'exports');

  // 查询define语句
  types.visit(ast, {
    visitCallExpression: function (path) {
      var node = path.node;

      if (
        n.Identifier.check(node.callee) &&
        node.callee.name === 'define'
      ) {
        defineNode = node;
        return false;
      } else {
        this.traverse(path);
      }
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
      var idInfo = getIdInfo(node.value);
      var id = idInfo.id;
      var idOption = idInfo.option;

      node.value = id;

      if (idOption.ignore || isIgnore(id, ignore)) {
        return cb();
      }

      // 修改依赖路径
      loader(module, id, function (err, dependedModule) {
        if (err) {
          return cb(err);
        }

        // 如果需要打包
        if (
          option.pack &&
          (idOption.pack || (module.isMain && dependedModule.canBePacked))
        ) {
          module.pack(dependedModule);
        }

        node.value = getRelativeId(dependedModule);
        cb();
      });
    },
    function (err) {
      if (err) {
        return cb(err);
      }

      var id = module.srcPath + '\'s id holder';
      var b = types.builders;

      // 设置模块ID
      if (!idNode) {
        idNode = b.literal(id);
        defineNode.arguments.unshift(idNode);
      } else {
        idNode.value = id;
      }

      // 添加ID回写的钩子
      module.addHook(function (cb) {
        var contents = module.contents.toString();
        module.contents = new Buffer(contents.replace(id, getRelativeId(module)));
        cb();
      });

      cb();
    }
  );
}

module.exports = defineParse;
