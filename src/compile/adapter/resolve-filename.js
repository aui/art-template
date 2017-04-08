const path = require('path');
const detectNode = require('detect-node');

/**
 * 获取模板的绝对路径
 * @param   {string} filename 
 * @param   {string} root 
 * @param   {?string} base 
 * @returns {string}
 */
const resolveFilename = (filename, root, base) => {
    /* istanbul ignore else  */
    if (detectNode) {
        const dirname = base ? path.dirname(base) : '';
        return path.resolve(root, dirname, filename);
    } else {
        return filename;
    }
};

module.exports = resolveFilename;