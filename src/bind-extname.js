const compile = require('./compile');
const defaults = require('./compile/defaults');
const detectNode = require('detect-node');
const importsPath = require.resolve('./compile/adapter/imports');

/**
 * 绑定模板文件后缀名，以让 NodeJS 支持 `require(templateFile)`
 * @param {function} require
 * @param {?string} extname 
 */
const bindExtname = (require, extname = defaults.extname) => {

    if (!detectNode) {
        return;
    }

    require.extensions[extname] = (module, flnm) => {
        const filename = flnm || module.filename;
        const render = compile({ filename });
        const imports = `var $imports=require(${JSON.stringify(importsPath)})`;
        module._compile(`${imports};\module.exports = ${render.toString()};`, filename);
    };
};


module.exports = bindExtname;