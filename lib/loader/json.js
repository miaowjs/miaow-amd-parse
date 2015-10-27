var recast = require('recast');
var path = require('path');

module.exports = function(context, module, cb) {
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
            recast.parse('return ' + module.contents.toString()).program.body[0]
          ])
        )
      ]))
    ]);

    contents = new Buffer(recast.print(ast).code);
  } catch (err) {
    return cb(err);
  }

  context.emitModule(path.basename(module.src) + '.js', contents, cb);
};
