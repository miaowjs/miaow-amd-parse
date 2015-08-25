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
            recast.parse('return ' + module.contents.toString()).program.body[0]
          ])
        )
      ]))
    ]);

    var contents = new Buffer(recast.prettyPrint(ast, {tabWidth: 2}).code);
  } catch (err) {
    return cb(err);
  }

  module.createModule(path.basename(module.srcPath) + '.js', contents, cb);
};
