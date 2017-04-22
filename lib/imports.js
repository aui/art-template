/*! art-template runtime dependencies | https://github.com/aui/art-template */


/**
 * 迭代器，支持数组与对象
 * @param {array|Object} data 
 * @param {function} callback 
 */
var each = function each(data, callback) {
    if (Array.isArray(data)) {
        for (var i = 0, len = data.length; i < len; i++) {
            callback(data[i], i, data);
        }
    } else {
        for (var _i in data) {
            callback(data[_i], _i);
        }
    }
};


/**
 * 编码模板输出的内容
 * @param  {any}   content
 * @return {string}
 */
var escape = function escape(content) {

    var escapeReg = /&(?![\w#]+;)|[<>"']/g;
    var escapeMap = {
        "<": "&#60;",
        ">": "&#62;",
        '"': "&#34;",
        "'": "&#39;",
        "&": "&#38;"
    };

    var toString = function toString(value) {
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

    return toString(content).replace(escapeReg, function (s) {
        return escapeMap[s];
    });
};


var imports = {
    $each: each,
    $escape: escape
};


module.exports = imports;