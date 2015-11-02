var path = require('path');

module.exports = function(context, idInfo, callback) {
  context.resolveModule(idInfo.id, function(err, module) {
    if (err) {
      return callback(err);
    }

    // 如果是第三方代码，就不做任何处理
    if (module.extra.isThirdparty) {
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
