const $include = (filename, data, base) => {
    const compile = require('./index');
    const isNodeEnv = typeof document !== 'object';

    if (isNodeEnv) {
        const path = require('path');
        const dirname = path.dirname(base);
        filename = path.resolve(root, dirname, filename);
    }

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


const utils = {
    $include,
    $escape
};

module.exports = utils;