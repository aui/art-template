const templatePath = require.resolve('./index');


/**
 * 绑定模板文件后缀名，以让 NodeJS 支持 `require(templateFile)`
 * @param {?string}   extname   后缀名
 * @param {?function} loader    require
 */
const bindExtname = (extname, loader = require) => {

    loader.extensions[extname] = (module, flnm) => {
        const filename = flnm || module.filename;
        const imports = `var template=require(${JSON.stringify(templatePath)})`;
        module._compile(`${imports};\module.exports = template.compile({filename:${JSON.stringify(filename)}});`, filename);
    };

};


module.exports = bindExtname;