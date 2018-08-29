const detectNode = require('detect-node');

/**
 * 读取模板内容（同步方法）
 * @param   {string}    filename   模板名
 * @param   {?Object}   options
 * @return  {string}
 */
const loader = (filename /*, options*/) => {
    /* istanbul ignore else  */
    if (detectNode) {
        const fs = require('fs');
        return fs.readFileSync(filename, 'utf8');
    } else {
        const elem = document.getElementById(filename);
        return elem.value || elem.innerHTML;
    }
};

module.exports = loader;
