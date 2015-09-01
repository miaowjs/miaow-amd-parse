module.exports = function (str) {
  var matched = str.match(/(.*?)(#.*)?$/);

  var id = matched[1];
  var option = {};

  (matched[2] || '').replace(/#/g, '').split('&').forEach(function (param) {
    param = param.split('=');

    option[param[0]] = param[1] || true;
  });

  return {
    id: id,
    option: option
  };
};
