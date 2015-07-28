var mutil = require('miaow-util');

module.exports = function (root, module) {
  return module.url ||
    mutil.relative(root, module.destAbsPathWithHash)
      .replace(/\.js$/, '');
};
