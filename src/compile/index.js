const defaults = require('./defaults');
const utils = require('./utils');
const Compiler = require('./compiler');

const compile = (source, options) => {
    options = Object.assign({}, defaults, options);

    const imports = options.imports;
    const debug = options.debug;

    const compiler = new Compiler(source, options);

    const render = data => {
        try {

            return render.original(
                data,
                Object.create(imports),
                Object.create(utils)
            );

        } catch (e) {

            if (debug) {
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
        render.original = compiler.build();
    } catch (e) {
        if (debug) {
            return options.onerror(e);
        } else {
            throw e;
        }
    }


    render.toString = function() {
        return render.original.toString();
    };


    return render;
};


module.exports = compile;