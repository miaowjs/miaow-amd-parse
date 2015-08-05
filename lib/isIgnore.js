var _ = require('lodash');

module.exports = function (id, ignoreList) {
  return !!_.find(ignoreList, function (ignore) {
    if (_.isString(ignore)) {
      return ignore === id;
    } else {
      return ignore.test(id);
    }
  });
};
