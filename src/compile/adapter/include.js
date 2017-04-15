/**
 * 载入子模板
 * @param   {string}    filename
 * @param   {Object}    data
 * @param   {Object}    options
 * @return  {string}
 */
const include = (filename, data, options) => {
    const compile = require('../index');
    options = options.$extend({
        filename: options.resolveFilename(filename, options.root, options.filename),
        source: null
    });
    return compile(options)(data);
};


module.exports = include;