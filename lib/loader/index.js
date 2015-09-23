var path = require('path');

module.exports = function (parentModule, idInfo, cb) {
  parentModule.getModule(idInfo.id, function (err, dependedModule) {
    if (err) {
      return cb(err);
    }
    
    var loader;
    var idOption = idInfo.option;
    

    if (idOption.content) {
      loader = 'content';
    } else if (idOption.url) {
      loader = 'default';
    } else {
      loader = {
        '.js': 'script',
        '.css': 'style',
        '.json': 'json'
      }[path.extname(dependedModule.destPath)] || 'default';
    }
    
    require('./' + loader)(dependedModule, cb);
  });
};
