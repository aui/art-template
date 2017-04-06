const Compiler = require('./compiler');
const defaults = require('./defaults');
const getOptions = require('./get-options');
const tplLoader = require('./tpl-loader');
const tplPath = require('./tpl-path.js');


/**
 * 编译模版
 * @param {string|Object} source   模板内容
 * @param {?Object}       options  编译选项
 * @returns {function}
 */
const compile = (source, options = {}) => {

    if (typeof source === 'object') {
        options = source;
    } else {
        options.source = source;
    }


    // 匹配缓存
    const filename = options.filename;
    const cache = options.cache !== undefined ? options.cache : defaults.cache
    if (cache && filename) {
        const render = cache.get(filename);
        if (render) {
            return render;
        }
    }


    // 合并默认配置
    options = getOptions(options, defaults);
    source = options.source;

    const debug = options.debug;


    // 加载外部模板
    if (!source) {
        try {
            const target = tplPath(filename, options.root);
            source = tplLoader(target);
            options.filename = target;
            options.source = source;
        } catch (e) {

            const error = {
                path: filename,
                name: 'Compile Error',
                message: `template not found: ${e.message}`,
                stack: e.stack
            };

            if (options.bail) {
                debug(error)();
                throw error;
            } else {
                return debug(error);
            }

        }

    }

    const compiler = new Compiler(options);

    const render = data => {

        try {
            return render.source(data);
        } catch (e) {

            // 运行时出错以调试模式重载
            if (!options.compileDebug) {
                options.cache = null;
                options.compileDebug = true;
                return compile(options)(data);
            }

            if (options.bail) {
                debug(e)();
                throw e;
            } else {
                return debug(e)();
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
        if (options.bail) {
            debug(e)()
            throw e;
        } else {
            return debug(e);
        }
    }


    render.toString = function() {
        return render.source.toString();
    };


    return render;
};



module.exports = compile;