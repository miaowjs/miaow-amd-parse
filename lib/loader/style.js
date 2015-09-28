var recast = require('recast');
var path = require('path');

var template = [
  'define(function () {',
  '  var style = \'\';',
  '  var useCount = 0;',
  '',
  '  var headElement;',
  '  var firstLinkElement;',
  '  var styleElement;',
  '',
  '  function use () {',
  '    if (useCount++ > 0) {',
  '      return;',
  '    }',
  '',
  '    if (!headElement) {',
  '      headElement = document.head || document.getElementsByTagName(\'head\')[0];',
  '    }',
  '',
  '    if (!firstLinkElement) {',
  '      var linkElements = headElement.getElementsByTagName(\'link\');',
  '      for(var i = 0, l = linkElements.length; i < l; ++i) {',
  '        if (linkElements[i].rel === \'stylesheet\') {firstLinkElement = linkElements[i]; break;}',
  '      }',
  '    }',
  '',
  '    if (!styleElement) {',
  '      styleElement = document.createElement(\'style\');',
  '      if (styleElement.styleSheet) {',
  '        styleElement.styleSheet.cssText = style;',
  '      } else {',
  '        styleElement.appendChild(document.createTextNode(style));',
  '      }',
  '    }',
  '',
  '    firstLinkElement ? headElement.insertBefore(styleElement, firstLinkElement) : headElement.appendChild(styleElement);',
  '  }',
  '',
  '  function unuse () {',
  '    if (useCount === 0) {',
  '      return;',
  '    }',
  '',
  '    if (--useCount === 0) {',
  '      headElement.removeChild(styleElement);',
  '    }',
  '  }',
  '',
  '  return {',
  '    use: use,',
  '    unuse: unuse',
  '  };',
  '});'
].join('');

module.exports = function (module, cb) {
  var types = recast.types;
  var b = types.builders;

  try {
    var templateAst = recast.parse(template);
    templateAst.program.body[0].expression.arguments[0].body.body[0].declarations[0].init =
      b.literal(module.contents.toString());

    var contents = new Buffer(recast.print(templateAst).code);
  } catch (err) {
    return cb(err);
  }

  module.createModule(path.basename(module.srcPath) + '.js', contents, cb);
};
