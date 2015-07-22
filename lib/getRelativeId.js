var path = require('path');

module.exports = function (root, module) {
  return module.url ||
    path.relative(root, module.destAbsPathWithHash)
      .split(path.sep)
      .join('/')
      .replace(/\.js$/, '');
};
