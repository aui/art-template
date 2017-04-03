const render = require('./render');
const compile = require('./compile');
const defaults = require('./compile/defaults');

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


// Add require support
if (module._compile) {
    const loader = (() => require)(); // 避免 webpack 进行静态分析
    loader.extensions[defaults.extension] = (module, flnm) => {
        const filename = flnm || module.filename;
        const options = {
            filename: filename,
            client: true
        };
        const fn = compile(options);
        const importsPath = loader.resolve('./compile/imports');
        module._compile(`var $imports=require(${JSON.stringify(importsPath)});\n` +
            `module.exports = ${fn.toString()};`, filename);
    };
}

module.exports = template;