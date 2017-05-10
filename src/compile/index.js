const Compiler = require('./compiler');
const defaults = require('./defaults');
const TemplateError = require('./error');


const debugRender = (error, options) => {
    options.onerror(error, options);
    const render = () => `{Template Error}`;
    render.mappings = [];
    render.sourcesContent = [];
    return render;
};


/**
 * 编译模版
 * @param {string|Object} source   模板内容
 * @param {?Object}       options  编译选项
 * @return {function}
 */
const compile = (source, options = {}) => {

    if (typeof source !== 'string') {
        options = source;
    } else {
        options.source = source;
    }

    // 合并默认配置
    options = defaults.$extend(options);
    source = options.source;

    // debug 模式
    /* istanbul ignore if */
    if (options.debug) {
        options.cache = false;
        options.bail = false;
        options.minimize = false;
        options.compileDebug = true;
    }


    if (options.compileDebug) {
        options.minimize = false;
    }


    // 转换成绝对路径
    if (options.filename) {
        options.filename = options.resolveFilename(options.filename, options);
    }


    const filename = options.filename;
    const cache = options.cache;
    const caches = options.caches;


    // 匹配缓存
    if (cache && filename) {
        const render = caches.get(filename);
        if (render) {
            return render;
        }
    }


    // 加载外部模板
    if (!source) {

        try {
            source = options.loader(filename, options);
            options.source = source;
        } catch (e) {

            const error = new TemplateError({
                name: 'CompileError',
                path: filename,
                message: `template not found: ${e.message}`,
                stack: e.stack
            });

            if (options.bail) {
                throw error;
            } else {
                return debugRender(error, options);
            }

        }

    }

    let fn;
    const compiler = new Compiler(options);


    try {
        fn = compiler.build();
    } catch (error) {
        error = new TemplateError(error);
        if (options.bail) {
            throw error;
        } else {
            return debugRender(error, options);
        }
    }


    const render = (data, blocks) => {

        try {
            return fn(data, blocks);
        } catch (error) {

            // 运行时出错以调试模式重载
            if (!options.compileDebug) {
                options.cache = false;
                options.compileDebug = true;
                return compile(options)(data, blocks);
            }

            error = new TemplateError(error);

            if (options.bail) {
                throw error;
            } else {
                return debugRender(error, options)();
            }

        }
    };

    render.mappings = fn.mappings;
    render.sourcesContent = fn.sourcesContent;
    render.toString = () => fn.toString();

    if (cache && filename) {
        caches.set(filename, render);
    }

    return render;
};

compile.Compiler = Compiler;

module.exports = compile;