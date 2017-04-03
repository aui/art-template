/**
 * 导入的全局模板变量
 */
const imports = {


    /**
     * 载入子模板
     * @param   {string}    filename
     * @param   {Object}    data
     * @param   {string}    base
     * @param   {string}    root
     * @returns {string}
     */
    $include: (filename, data, base, root) => {
        const compile = require('../index');
        const tplPath = require('../tpl-path');
        filename = tplPath(filename, root, base);
        return compile({
            filename
        })(data);
    },


    /**
     * 编码模板输出的内容
     * @param   {Any}   content
     * @returns {string}
     */
    $escape: content => {
        const escapeReg = /&(?![\w#]+;)|[<>"']/g;
        const escapeMap = {
            "<": "&#60;",
            ">": "&#62;",
            '"': "&#34;",
            "'": "&#39;",
            "&": "&#38;"
        };

        const toString = value => {
            if (typeof value !== 'string') {
                if (typeof value === 'function') {
                    value = toString(value.call(value));
                } else if (value === null) {
                    value = '';
                } else {
                    value = JSON.stringify(value) || '';
                }
            }

            return value;
        };

        return toString(content)
            .replace(escapeReg, s => escapeMap[s]);
    }

};

module.exports = imports;