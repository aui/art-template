define(function () {return {
'$escapeHTML': function (content) {

            return typeof content === 'string'
            ? content.replace(/&(?![\w#]+;)|[<>"']/g, function (s) {
                return {
                    "<": "&#60;",
                    ">": "&#62;",
                    '"': "&#34;",
                    "'": "&#39;",
                    "&": "&#38;"
                }[s];
            })
            : content;
        },
'$getValue': function (value) {

            if (typeof value === 'string' || typeof value === 'number') {

                return value;

            } else if (typeof value === 'function') {

                return value();

            } else {

                return '';

            }

        },
'$each': function (data, callback) {

    var isArray = Array.isArray || function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
     
    if (isArray(data)) {
        for (var i = 0, len = data.length; i < len; i++) {
            callback.call(data, data[i], i, data);
        }
    } else {
        for (var i in data) {
            callback.call(data, data[i], i);
        }
    }
    
}}});