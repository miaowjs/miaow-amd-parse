var recast = require('recast');

module.exports = function(module) {
  var ast;

  try {
    ast = recast.parse(module.srcContents.toString());
  } catch (err) {
    return false;
  }

  var isThirdparty = false;

  // 查询define语句
  recast.types.visit(ast, {
    visitComment: function(path) {
      if (/^\/\*\!|@preserve|@license|@cc_on/.test(path.value.value)) {
        isThirdparty = true;
        return false;
      }

      this.traverse(path);
    }
  });

  return isThirdparty;
};
