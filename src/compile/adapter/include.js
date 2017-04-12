/**
 * 载入子模板
 * @param   {string}    filename
 * @param   {Object}    data
 * @param   {string}    base
 * @param   {string}    root
 * @return  {string}
 */
const include = (filename, data, base, root) => {
    const compile = require('../index');
    const resolveFilename = require('./resolve-filename');
    filename = resolveFilename(filename, root, base);
    return compile({
        filename
    })(data);
};


module.exports = include;