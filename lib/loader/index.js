var path = require('path');

module.exports = function (parentModule, id, cb) {
  parentModule.getModule(id, function (err, dependedModule) {
    if (err) {
      return cb(err);
    }

    var loader = {
        '.js': 'script',
        '.css': 'style',
        '.json': 'json'
      }[path.extname(dependedModule.destPath)] || 'default';

    require('./' + loader)(dependedModule, cb);
  });
};
