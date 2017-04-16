/**
 * 读取模板内容（同步方法）
 * @param   {string}    模板名
 * @param   {string}
 */
const detectNode = require('detect-node');
const loader = (filename, extname) => {
    /* istanbul ignore else  */
    if (detectNode) {
        const fs = require('fs');
        const path = require('path');

        if (!path.extname(filename)) {
            filename = filename + extname;
        }

        return fs.readFileSync(filename, 'utf8');
    } else {
        const elem = document.getElementById(filename);
        return elem.value || elem.innerHTML;
    }
};

module.exports = loader;