var _ = require('lodash');
var async = require('async');
var recast = require('recast');

var getIdInfo = require('./getIdInfo');
var loader = require('./loader');

function defineParse(context, options, ast, callback) {
  var types = recast.types;
  var namedTypes = types.namedTypes;

  var defineNode;

  // 查询define语句
  types.visit(ast, {
    visitCallExpression: function(path) {
      if (
        namedTypes.Identifier.check(path.node.callee) &&
        path.node.callee.name === 'define'
      ) {
        defineNode = path.node;
        this.abort();
      }

      this.traverse(path);
    }
  });

  // 如果没有查到define语句
  if (!defineNode) {
    return callback();
  }

  var idNode;
  var args = defineNode.arguments;
  var dependenciesNode = {elements: []};

  // 获取模块标识
  if (args.length > 1 && namedTypes.Literal.check(args[0])) {
    idNode = args[0];

    args = args.slice(1);
  }

  // 获取依赖
  if (args.length > 1 && namedTypes.ArrayExpression.check(args[0])) {
    dependenciesNode = args[0];

    args = args.slice(1);
  }

  async.eachSeries(
    dependenciesNode.elements,
    function(node, callback) {
      var idInfo = getIdInfo(node.value);

      node.value = idInfo.id;

      // 调试用的模块
      if (idInfo.debug && !context.debug) {
        node.value = '';
        return callback();
      }

      // 屏蔽的关键字
      if (idInfo.ignore || ['require', 'module', 'exports'].indexOf(idInfo.id) !== -1) {
        return callback();
      }

      // 修改依赖路径
      loader(context, idInfo, function(err, module) {
        if (err) {
          return callback(err);
        }

        if (_.isString(module)) {
          node.value = idInfo.id;
        } else {
          node.value = module.url;

          context.extra.AMDDependencies.push(module.src);
        }

        callback();
      });
    },

    function(err) {
      if (err) {
        return callback(err);
      }

      var id = context.src + '\'s id holder';

      // 设置模块ID
      if (!idNode) {
        idNode = types.builders.literal(id);
        defineNode.arguments.unshift(idNode);
      } else {
        idNode.value = id;
      }

      // 添加ID回写的钩子
      context.addHook(function(context, callback) {
        context.contents = new Buffer(context.contents.toString().replace(id, context.url));
        callback();
      });

      callback();
    }
  );
}

module.exports = defineParse;
