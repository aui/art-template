const detectNode = require('detect-node');
const LOCAL_MODULE = /^\.+\//;

/**
 * 获取模板的绝对路径
 * @param   {string} filename
 * @param   {Object} options
 * @return  {string}
 */
const resolveFilename = (filename, options) => {
    /* istanbul ignore else  */
    if (detectNode) {
        const path = require('path');
        const root = options.root;
        const extname = options.extname;

        if (LOCAL_MODULE.test(filename)) {
            const from = options.filename;
            const self = !from || filename === from;
            const base = self ? root : path.dirname(from);
            filename = path.resolve(base, filename);
        } else {
            filename = path.resolve(root, filename);
        }

        if (!path.extname(filename)) {
            filename = filename + extname;
        }
    }

    return filename;
};

module.exports = resolveFilename;
