/**
 * 读取模板内容（同步方法）
 * @param   {string}    模板名
 * @param   {string}
 */
const detectNode = require('detect-node');
const tplLoader = filename => {
    if (detectNode) {
        const fs = require('fs');
        return fs.readFileSync(filename, 'utf8');
    } else {
        const elem = document.getElementById(filename);
        return elem.value || elem.innerHTML;
    }
};

module.exports = tplLoader;