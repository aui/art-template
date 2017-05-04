const templatePath = require.resolve('./index.js');

/**
 * require.extensions 扩展注册函数
 * 使用动态编译机制
 * @param {Object} module 
 * @param {string} flnm 
 */
const extension = function (module, flnm) {
    const filename = flnm || module.filename;
    const imports = 'var template=require(' + JSON.stringify(templatePath) + ')';
    const options = JSON.stringify({
        filename: filename
    });

    module._compile(imports + '\n' + 'module.exports = template.compile(' + options + ');', filename);
};


module.exports = extension;