const toString = (value, type) => {

    if (typeof value !== 'string') {

        type = typeof value;
        if (type === 'number') {
            value += '';
        } else if (type === 'function') {
            value = toString(value.call(value));
        } else {
            value = '';
        }
    }

    return value;

};


const escapeMap = {
    '<': '&#60;',
    '>': '&#62;',
    '': '&#34;',
    '': '&#39;',
    '&': '&#38;'
};


const escapeFn = s => {
    return escapeMap[s];
};

const escapeHTML = content => {
    return toString(content)
        .replace(/&(?![\w#]+;)|[<>"']/g, escapeFn);
};


const each = (data, callback) => {
    if (Array.isArray(data)) {
        for (let i = 0, len = data.length; i < len; i++) {
            callback.call(data, data[i], i, data);
        }
    } else {
        for (let i in data) {
            callback.call(data, data[i], i);
        }
    }
};


const utils = {

    $include: renderFile,

    $string: toString,

    $escape: escapeHTML,

    $each: each

};

module.export = utils;