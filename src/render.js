const compile = require('./compile');

/**
 * 渲染模板
 * @param   {string}    模板
 * @param   {Object}    数据
 * @param   {Object}    选项
 * @return  {string}    渲染好的字符串
 */
const render = (source, data, options) => {
    return compile(source, options)(data);
};

module.exports = render;