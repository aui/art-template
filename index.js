var template = require('./lib/template-node.js');
var templatePath = require.resolve('./lib/template-node.js');
var imports = 'var template=require(' + JSON.stringify(templatePath) + ')';

var extension = function (module, flnm) {
    var filename = flnm || module.filename;
    var options = JSON.stringify({
        filename: filename
    });

    module._compile(imports + '\n' + 'module.exports = template.compile(' + options + ');', filename);
};

template.extension = extension;
require.extensions[template.defaults.extname] = extension;

module.exports = template;