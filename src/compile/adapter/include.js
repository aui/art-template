/**
 * 载入子模板
 * @param   {string}    filename
 * @param   {Object}    data
 * @param   {string}    base
 * @param   {string}    root
 * @returns {string}
 */
const include = (filename, data, base, root) => {
    const compile = require('../index');
    const tplPath = require('../tpl-path');
    filename = tplPath(filename, root, base);
    return compile({
        filename
    })(data);
};


module.exports = include;