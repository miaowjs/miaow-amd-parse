var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var postcss = require('postcss');
var recast = require('recast');

var template = fs.readFileSync(path.resolve(__dirname, './templates/styleScript.js'));

function processModule(idInfo, module) {
  return new Promise(function(resolve, reject) {
    var out = {
      src: module.src.replace(/\.[^\.]+$/, ''),
      contents: module.contents.toString(),
      dest: module.src + '.js',
      modules: '{}',
    };

    if (!idInfo.module) {
      return resolve(out);
    }

    out.dest = module.src + '.module.js';

    var cssModulePlugin = require('postcss-modules')({
      generateScopedName: '[path][name]__[local]',
      getJSON: function(cssFileName, json) {
        out.modules = JSON.stringify(json);
      }
    });

    postcss([ cssModulePlugin ])
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
