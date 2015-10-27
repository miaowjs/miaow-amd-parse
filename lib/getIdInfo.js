module.exports = function(str) {
  var matched = str.match(/(.*?)(#.*)?$/);

  var info = {id: matched[1]};

  (matched[2] || '').replace(/#/g, '').split('&').forEach(function(param) {
    param = param.split('=');

    info[param[0]] = param[1] || true;
  });

  return info;
};
