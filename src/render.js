const compile = require('./compile');

/**
 * 渲染模板
 * @param   {string|Object}    source  模板内容
 * @param   {Object}    data    数据
 * @param   {?Object}   options 选项
 * @return  {string}            渲染好的字符串
 */
const render = (source, data, options) => compile(source, options)(data);

module.exports = render;