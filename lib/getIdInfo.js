var isUrl = require('is-url-superb');
var pathIsAbsolute = require('path-is-absolute');

module.exports = function(str) {
  if (isUrl(str) || pathIsAbsolute(str)) {
    return {id: str, ignore: true};
  }

  var matched = str.match(/(.*?)(#.*)?$/);

  var info = {id: matched[1]};

  (matched[2] || '').replace(/#/g, '').split('&').forEach(function(param) {
    param = param.split('=');

    info[param[0]] = param[1] || true;
  });

  return info;
};
