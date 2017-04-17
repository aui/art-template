const detectNode = require('detect-node');

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
        const base = filename !== options.filename && options.filename
        const dirname = base ? path.dirname(base) : '';

        if (!path.extname(filename)) {
            filename = filename + extname;
        }

        return path.resolve(root, dirname, filename);
    } else {
        return filename;
    }
};

module.exports = resolveFilename;