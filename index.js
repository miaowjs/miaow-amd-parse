var async = require('async');
var mutil = require('miaow-util');
var recast = require('recast');

var pkg = require('./package.json');

function parse(option, cb) {
  var ast = recast.parse(this.file.contents.toString());
  var types = recast.types;
  var n = types.namedTypes;
  var defineNode;

  //查询define语句
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

  //如果没有查到define语句
  if (!defineNode) {
    return cb();
  }

  var args = defineNode.arguments;
  var idNode;
  var dependenciesNode = {elements: []};

  //获取模块标识
  if (args.length > 1 && n.Literal.check(args[0])) {
    idNode = args[0];

    args = args.slice(1);
  }

  //获取依赖
  if (args.length > 1 && n.ArrayExpression.check(args[0])) {
    dependenciesNode = args[0];

    args = args.slice(1);
  }

  async.eachSeries(dependenciesNode.elements, function (elementNode, cb) {
    //修改依赖路径
    this.getModule(elementNode.value, function (err, module) {
      if (err) {
        return cb(new mutil.PluginError(pkg.name, err, {
          fileName: this.srcAbsPath,
          lineNumber: elementNode.loc.start.line
        }));
      }

      //添加依赖信息
      this.dependencies.push(module.srcPath);

      elementNode.value = module.url || module.destPathWithHash;
      cb();
    }.bind(this));
  }.bind(this), function (err) {
    if (err) {
      if (!err instanceof mutil.PluginError) {
        err = new mutil.PluginError(pkg.name, err, {
          fileName: this.srcAbsPath,
          lineNumber: defineNode.loc.start.line
        });
      }

      return cb(err);
    }

    //修改文件内容
    this.file.contents = new Buffer(recast.print(ast).code);

    var id = this.url || this.destPathWithHash;
    var b = types.builders;

    //设置模块ID
    if (!idNode) {
      idNode = b.literal(id);
      defineNode.arguments.unshift(idNode);
    } else {
      idNode.value = id;
    }

    //修改文件内容
    this.file.contents = new Buffer(recast.print(ast).code);

    cb();
  }.bind(this));
}

module.exports = parse;
