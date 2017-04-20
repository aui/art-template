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
        source: null,
        // include() 大部分都是代码片段，
        // 这很可能会被 htmlMinifier 过滤掉
        minimize: false
    });
    return compile(options)(data, blocks);
};


module.exports = include;