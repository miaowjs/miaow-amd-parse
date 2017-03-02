var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var postcss = require('postcss');
var recast = require('recast');
var selectorParser = require('postcss-selector-parser');

var template = fs.readFileSync(path.resolve(__dirname, './templates/styleScript.js'));

var addId = postcss.plugin('add-id', function(opts) {
  return function(root) {
    root.each(function rewriteSelector(node) {
      if (!node.selector) {
        // handle media queries
        if (node.type === 'atrule' && node.name === 'media') {
          node.each(rewriteSelector);
        }
        return;
      }
      node.selector = selectorParser(function(selectors) {
        selectors.each(function(selector) {
          var node = null;
          selector.each(function(n) {
            if (n.type !== 'pseudo') node = n;
          });
          selector.insertAfter(node, selectorParser.attribute({
            attribute: opts.id
          }));
        });
      }).process(node.selector).result;
    });
  };
});

var trim = postcss.plugin('trim', function() {
  return function(css) {
    css.walk(function(node) {
      if (node.type === 'rule' || node.type === 'atrule') {
        node.raws.before = node.raws.after = '\n';
      }
    });
  };
});

function processModule(idInfo, module) {
  return new Promise(function(resolve, reject) {
    var out = {
      src: module.src.replace(/\.[^\.]+$/, ''),
      contents: module.contents.toString(),
      dest: module.src + '.js',
      modules: '{}',
    };

    if (!idInfo.module && !idInfo.scoped) {
      return resolve(out);
    }

    var plugins = [trim];

    if (idInfo.module) {
      out.dest = module.src + '.module.js';
      var cssModulePlugin = require('postcss-modules')({
        generateScopedName: '[path][name]__[local]',
        getJSON: function(cssFileName, json) {
          out.modules = JSON.stringify(json);
        }
      });
      plugins.push(cssModulePlugin);
    }

    if (idInfo.scoped) {
      plugins.push(addId({id: idInfo.scoped}));
      out.dest = module.src + '.scoped.js';
    }

    postcss(plugins)
      .process(out.contents, { from: module.src })
      .then(function(result) {
        out.contents = result.css;
        resolve(out);
      })
      .catch(reject);
  });
}

module.exports = function(context, idInfo, module, callback) {
  var types = recast.types;
  var b = types.builders;

  processModule(idInfo, module)
    .then(function(out) {
      try {
        // 填充样式内容
        var templateAst = recast.parse(_.template(template)({
          src: out.src,
          modules: out.modules
        }));
        templateAst.program.body[0].expression.arguments[0].body.body[0].declarations[0].init =
          b.literal(out.contents);

        var contents = new Buffer(recast.print(templateAst).code);
        // 产出内容
        context.emitModule(out.dest, contents, callback);
      } catch (err) {
        return Promise.reject(err);
      }
    })
    .catch(callback);
};
