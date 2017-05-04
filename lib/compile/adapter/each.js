"use strict";

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

module.exports = each;