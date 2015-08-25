var mutil = require('miaow-util');

module.exports = function (module) {
  return module.url ||
    mutil.relative('', module.destPathWithHash)
      .replace(/\.js$/, '');
};
