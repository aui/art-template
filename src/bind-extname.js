const compile = require('./compile');
const defaults = require('./compile/defaults');
const detectNode = require('detect-node');
const importsPath = require.resolve('./compile/adapter/imports');

/**
 * 绑定后缀名，以让 NodeJS 支持 `require(templateFile)`
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

        module._compile(`var $imports=require(${JSON.stringify(importsPath)});\n` +
            `module.exports = ${render.toString()};`, filename);
    };
};


module.exports = bindExtname;