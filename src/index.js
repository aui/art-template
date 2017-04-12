const detectNode = require('detect-node');
const render = require('./render');
const compile = require('./compile');
const defaults = require('./compile/defaults');
const bindExtname = require('./bind-extname');
const EXTNAME = '.art';

/**
 * 模板引擎
 * @param   {string}            filename 模板名
 * @param   {Object|string}     content  数据或模板内容
 * @return  {string|function}            如果 content 为 string 则编译并缓存模板，否则渲染模板
 */
const template = (filename, content) => {
    return typeof content === 'object' ?
        render({
            filename
        }, content) :
        compile({
            filename,
            source: content
        });
};

template.render = render;
template.compile = compile;
template.defaults = defaults;
template.imports = defaults.imports;

if (detectNode) {
    bindExtname(EXTNAME, require);
}

module.exports = template;