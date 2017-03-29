const compile = require('./compile');
const cache = require('./cache');
const readFile = require('./read-file');


/**
 * 渲染模板(根据模板名)
 * @name    template.render
 * @param   {string}    模板名
 * @param   {Object}    数据
 * @return  {string}    渲染好的字符串
 */
const renderFile = (filename, data, options = {}) => {

    if (options.cache) {
        const render = cache.get(filename);
        if (render) {
            return render;
        }
    }

    const source = readFile(filename);
    options.filename = filename;

    if (!source) {
        return onerror({
            path: filename,
            name: 'Render Error',
            message: 'Template not found'
        })();
    } else {
        const render = compile(source, options);

        if (options.cache) {
            cache.set(filename, render);
        }

        return data ? render(data) : render;
    }
};

module.exports = renderFile;