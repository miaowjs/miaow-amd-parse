var path = require('path');

var contentLoader = require('./content');
var defaultLoader = require('./default');
var jsonLoader = require('./json');
var scriptLoader = require('./script');
var styleLoader = require('./style');

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
      loader = contentLoader;
    } else if (idInfo.url) {
      loader = defaultLoader;
    } else {
      loader = {
        js: scriptLoader,
        css: styleLoader,
        json: jsonLoader,
        tpl: contentLoader
      }[path.extname(module.dest).replace(/^\./, '')] || defaultLoader;
    }

    loader(context, idInfo, module, callback);
  });
};
