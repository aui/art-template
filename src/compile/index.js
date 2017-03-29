const defaults = require('./defaults');
const utils = require('./utils');
const Compiler = require('./compiler');

const compile = (source, options) => {
    options = Object.assign({}, defaults, options);

    const filename = options.filename;
    const imports = options.imports;

    const compiler = new Compiler(source, options);

    const render = data => {
        try {

            return render.original(
                data,
                filename,
                Object.create(imports),
                Object.create(utils)
            );

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


    return render;
};


module.exports = compile;