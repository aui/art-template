/**
 * 编码模板输出的内容
 * @param   {Any}   content
 * @returns {string}
 */
const escape = content => {

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
                // number | array | object | undefined
                value = JSON.stringify(value) || '';
            }
        }

        return value;
    };

    return toString(content)
        .replace(escapeReg, s => escapeMap[s]);
};


module.exports = escape;