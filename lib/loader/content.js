var recast = require('recast');
var path = require('path');

module.exports = function (module, cb) {
  var types = recast.types;
  var b = types.builders;

  try {
    var ast = b.program([
      b.expressionStatement(b.callExpression(b.identifier('define'), [
        b.functionExpression(
          null,
          [],
          b.blockStatement([
            b.returnStatement(
              b.literal(module.contents.toString())
            )
          ])
        )
      ]))
    ]);

    var contents = new Buffer(recast.print(ast).code);
  } catch (err) {
    return cb(err);
  }

  module.createModule(path.basename(module.srcPath) + '.js', contents, cb);
};
