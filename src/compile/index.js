const Compiler = require('./compiler');
const defaults = require('./defaults');


/**
 * 编译模版
 * @param {string|Object} source   模板内容
 * @param {?Object}       options  编译选项
 * @return {function}
 */
const compile = (source, options = {}) => {

    if (typeof source === 'object') {
        options = source;
    } else {
        options.source = source;
    }

    // 合并默认配置
    options = defaults.$extend(options);
    source = options.source;


    // debug 模式
    if (options.debug) {
        options.cache = false;
        options.bail = false;
        options.minimize = false;
        options.compileDebug = true;
    }


    const onerror = options.onerror;
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
        
        const target = options.resolveFilename(filename, options);

        try {
            source = options.loader(target, options);
            options.filename = target;
            options.source = source;
        } catch (e) {

            const error = {
                path: filename,
                name: 'CompileError',
                message: `template not found: ${e.message}`,
                stack: e.stack
            };

            if (options.bail) {
                throw error;
            } else {
                return onerror(error, options);
            }

        }

    }

    const compiler = new Compiler(options);

    const render = (data, blocks) => {

        try {
            return render.source(data, blocks);
        } catch (error) {

            // 运行时出错以调试模式重载
            if (!options.compileDebug) {
                options.cache = false;
                options.compileDebug = true;
                return compile(options)(data, blocks);
            }

            if (options.bail) {
                throw error;
            } else {
                return onerror(error, options)();
            }

        }
    };


    try {
        render.source = compiler.build();

        // 缓存编译成功的模板
        if (cache && filename) {
            caches.set(filename, render);
        }

    } catch (error) {
        if (options.bail) {
            throw error;
        } else {
            return onerror(error, options);
        }
    }


    render.toString = function() {
        return render.source.toString();
    };


    return render;
};

compile.Compiler = Compiler;

module.exports = compile;