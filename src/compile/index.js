const Compiler = require('./compiler');
const config = require('./config');
const utils = require('./utils');
const fileLoader = require('./file-loader');


/**
 * 编译模版
 * @param {string|Object} source   模板内容
 * @param {?Object}       options  编译选项
 * @returns {function}
 */
const compile = (source, options = {}) => {

    if (typeof source === 'object') {
        options = source;
    }

    options = Object.assign({}, config, options);
    source = source || options.source;

    const cache = options.cache;
    const filename = options.filename;

    // 探寻缓存
    if (cache && filename) {
        const render = cache.get(filename);
        if (render) {
            return render;
        }
    }

    // 加载外部模板
    if (!source) {

        try {
            source = fileLoader(filename);
        } catch (e) {

            const error = {
                path: filename,
                name: 'Render Error',
                message: `Template not found: ${e.message}`,
                stack: e.stack
            };

            if (options.onerror) {
                return options.onerror(error);
            } else {
                throw error;
            }

        }

    }

    const compiler = new Compiler(source, options);

    const render = data => {
        try {

            return render.source(
                data,
                Object.create(options.imports),
                Object.create(utils)
            );

        } catch (e) {

            if (options.onerror) {
                // 运行时出错以调试模式重载
                if (!options.compileDebug) {
                    options.compileDebug = true;
                    return compile(source, options)(data);
                }

                return options.onerror(e)();
            } else {
                throw e;
            }

        }
    };


    try {
        render.source = compiler.build();

        // 缓存编译成功的模板
        if (cache && filename) {
            cache.set(filename, render);
        }

    } catch (e) {
        if (options.onerror) {
            return options.onerror(e);
        } else {
            throw e;
        }
    }


    render.toString = function() {
        return render.source.toString();
    };


    return render;
};

module.exports = compile;