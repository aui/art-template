function template(content) {
    return compile(content);
};

var String = this.String;

function toString(value, type) {

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


var escapeMap = {
    "<": "&#60;",
    ">": "&#62;",
    '"': "&#34;",
    "'": "&#39;",
    "&": "&#38;"
};


function escapeFn(s) {
    return escapeMap[s];
}


function escapeHTML(content) {
    return toString(content)
        .replace(/&(?![\w#]+;)|[<>"']/g, escapeFn);
};


var isArray = Array.isArray || function (obj) {
    return ({}).toString.call(obj) === '[object Array]';
};


function each(data, callback) {
    if (isArray(data)) {
        for (var i = 0, len = data.length; i < len; i++) {
            callback.call(data, data[i], i, data);
        }
    } else {
        for (i in data) {
            callback.call(data, data[i], i);
        }
    }
};


var utils = template.utils = {

    $helpers: {},

    $include: function () {
        throw new Error('art-template/loader: not support `include`.');
    },

    $string: toString,

    $escape: escapeHTML,

    $each: each

};


var helpers = template.helpers = utils.$helpers;


function compile(fn) {
    var render = function (data) {
        try {
            return new fn(data) + '';
        } catch (e) {
            return showDebugInfo(e)();
        }
    };

    render.prototype = fn.prototype = utils;
    render.toString = function () {
        return fn + '';
    };

    return render;
};


function showDebugInfo(e) {

    var type = "{Template Error}";
    var message = e.stack || '';

    if (message) {
        // 利用报错堆栈信息
        message = message.split('\n').slice(0, 2).join('\n');
    } else {
        // 调试版本，直接给出模板语句行
        for (var name in e) {
            message += "<" + name + ">\n" + e[name] + "\n\n";
        }
    }

    return function () {
        if (typeof console === "object") {
            console.error(type + "\n\n" + message);
        }
        return type;
    };
};

template.helper = function (name, helper) {
    helpers[name] = helper;
};

module.exports = template;