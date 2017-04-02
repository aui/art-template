const tplPath = require('./tpl-path.js');

const $include = (filename, data, base, root) => {
    const compile = require('./index');
    filename = tplPath(filename, root, base);
    return compile({
        filename
    })(data);
};


const $escape = content => {
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
            } else {
                value = JSON.stringify(value) || '';
            }
        }

        return value;
    };
    return toString(content)
        .replace(/&(?![\w#]+;)|[<>"']/g, s => escapeMap[s]);
};

/**
 * 导入的全局模板变量
 */
const imports = {
    $include,
    $escape
};

module.exports = imports;