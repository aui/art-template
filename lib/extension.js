var template = require('../');
var templatePath = require.resolve('../');


/**
 * 绑定模板文件后缀名，以让 NodeJS 支持 `require(templateFile)`
 * @param {?string}   extname   后缀名
 */
var extension = function (extname) {
    require.extensions[extname] = function (module, flnm) {
        const filename = flnm || module.filename;
        const imports = 'var template=require(' + JSON.stringify(templatePath) + ')';
        module._compile(imports + '\n' + 'module.exports = template.compile({filename:' + JSON.stringify(filename) + '});', filename);
    };

};

extension('.art');
template.extension = extension;

module.exports = template;