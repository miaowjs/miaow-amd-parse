var recast = require('recast');
var path = require('path');

module.exports = function(context, module, callback) {
  var types = recast.types;
  var b = types.builders;

  var contents;

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

    contents = new Buffer(recast.print(ast).code);
  } catch (err) {
    return callback(err);
  }

  context.emitModule(path.basename(module.src) + '.content.js', contents, callback);
};
