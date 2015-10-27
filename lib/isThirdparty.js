var recast = require('recast');

module.exports = function(module) {
  var ast;

  try {
    ast = recast.parse(module.srcContents.toString());
  } catch (err) {
    return false;
  }

  var isThirdparty = false;

  recast.types.visit(ast, {
    visitComment: function(path) {
      if (path.value.type === 'Block' && path.value.value.charAt(0) === '!') {
        isThirdparty = true;
        return false;
      }

      this.traverse(path);
    }
  });

  return isThirdparty;
};
