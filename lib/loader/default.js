var recast = require('recast');

module.exports = function(context, idInfo, module, callback) {
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
              b.literal(module.url)
            )
          ])
        )
      ]))
    ]);

    contents = new Buffer(recast.print(ast).code);
  } catch (err) {
    return callback(err);
  }

  context.emitModule(module.src + '.url.js', contents, callback);
};
