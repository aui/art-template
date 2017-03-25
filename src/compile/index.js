const defaults = require('../defaults');
const utils = require('./utils');
const Compiler = require('./compiler');

const compile = (source, options) => {
    options = Object.assign({}, defaults, options);

    const filename = options.filename;
    const compiler = new Compiler(options);
    compiler.addSource(source);

    const render = data => {
        try {

            return render.original(data, {
                $filename: filename,
                $filters: {},
                $utils: utils
            });

        } catch (e) {

            // 运行时出错以调试模式重载
            if (!options.debug) {
                options.debug = true;
                return compile(source, options)(data);
            }

            return options.onerror(e)();
        }
    };


    try {
        render.original = compiler.build();
    } catch (e) {
        return options.onerror(e);
    }


    render.toString = function() {
        return render.original.toString();
    };


    if (filename !== `anonymous` && options.cache) {
        options.cache[filename] = render;
    }


    return render;
};


module.exports = compile;