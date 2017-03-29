/**
 * 模板引擎
 * @name    template
 * @param   {string}            模板名
 * @param   {Object, string}    数据。如果为字符串则编译并缓存编译结果
 * @return  {string, function}  渲染好的 HTML 字符串或者渲染方法
 */
const template = (filename, content, options) => {
    return typeof content === 'string' ?
        template.compile(content, {
            filename: filename
        }) :
        template.renderFile(filename, content, options);
};

template.cache = require('./cache');
template.render = require('./render');
template.compile = require('./compile');
template.renderFile = require('./render-file');
template.fileLoader = require('./read-file');
template.defaults = require('./compile/defaults');

module.exports = template;