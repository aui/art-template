const detectNode = require('detect-node');

/**
 * 获取模板的绝对路径
 * @param   {string} filename 
 * @param   {string} root
 * @param   {string} extname 
 * @param   {?string} base 
 * @return  {string}
 */
const resolveFilename = (filename, root, extname, base) => {
    /* istanbul ignore else  */
    if (detectNode) {
        const path = require('path');
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