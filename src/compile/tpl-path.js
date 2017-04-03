const path = require('path');
const isNodeEnv = typeof document !== 'object';

/**
 * 获取模板的绝对路径
 * @param   {string} filename 
 * @param   {string} root 
 * @param   {?string} base 
 * @returns {string}
 */
const tplPath = (filename, root, base) => {
    if (isNodeEnv) {
        const dirname = base ? path.dirname(base) : '';
        return path.resolve(root, dirname, filename);
    } else {
        return filename;
    }
};

module.exports = tplPath;