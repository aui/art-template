/**
 * 载入子模板
 * @param   {string}    filename
 * @param   {Object}    data
 * @param   {Object}    blocks
 * @param   {Object}    options
 * @return  {string}
 */
const include = (filename, data, blocks, options) => {
    const compile = require('../index');
    options = options.$extend({
        filename: options.resolveFilename(filename, options),
        bail: true,
        source: null
    });
    return compile(options)(data, blocks);
};

module.exports = include;
