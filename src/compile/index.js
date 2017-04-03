const Compiler = require('./compiler');
const config = require('./config');
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
        source = options.source;
    } else {
        options.source = source;
    }

    options = defaults(options, config);

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
            const target = tplPath(filename, options.root);
            source = tplLoader(target);
            options.filename = target;
            options.source = source;
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

    const compiler = new Compiler(options);

    const render = data => {
        try {

            return render.source(data);

        } catch (e) {

            if (options.onerror) {

                // 运行时出错以调试模式重载
                if (!options.compileDebug) {
                    options.cache = null;
                    options.compileDebug = true;
                    return compile(options)(data);
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


const deepClone = function(object) {
    if (typeof object === 'object' && object !== null) {
        if (Array.isArray(object)) {
            const clone = [];
            object.forEach(function(value, index) {
                clone[index] = deepClone(value);
            });
            return clone;
        } else {
            const clone = {};
            for (let name in object) {
                clone[name] = deepClone(object[name]);
            }
            return clone;
        }
    } else {
        return object;
    }
};



const defaults = (options, defaults) => {
    const config = deepClone(defaults);
    for (let name in options) {
        config[name] = deepClone(options[name]);
    }
    return config;
};


module.exports = compile;