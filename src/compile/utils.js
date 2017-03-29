const $include = require('../render-file');

const $string = value => {
    if (typeof value !== 'string') {
        if (typeof value === 'function') {
            value = $string(value.call(value));
        } else {
            value = JSON.stringify(value) || '';
        }
    }

    return value;
};


const $escape = content => {
    const escapeMap = {
        "<": "&#60;",
        ">": "&#62;",
        '"': "&#34;",
        "'": "&#39;",
        "&": "&#38;"
    };
    return $string(content)
        .replace(/&(?![\w#]+;)|[<>"']/g, s => escapeMap[s]);
};


const utils = {
    $include,
    $string,
    $escape
};

module.exports = utils;