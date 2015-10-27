var path = require('path');

var isThirdparty = require('../isThirdparty');

module.exports = function(context, idInfo, callback) {
  context.resolveModule(idInfo.id, function(err, module) {
    if (err) {
      return callback(err);
    }

    context.addFileDependency(module.src);

    if (isThirdparty(module)) {
      return callback(null, module.src);
    }

    var loader;

    if (idInfo.content) {
      loader = 'content';
    } else if (idInfo.url) {
      loader = 'default';
    } else {
      loader = {
          '.js': 'script',
          '.css': 'style',
          '.json': 'json',
          '.tpl': 'content'
        }[path.extname(module.dest)] || 'default';
    }

    require('./' + loader)(context, module, callback);
  });
};
