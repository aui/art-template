/**
 * 迭代器，支持数组与对象
 * @param {array|Object} data 
 * @param {function} callback 
 */
const each = (data, callback) => {
    if (Array.isArray(data)) {
        for (let i = 0, len = data.length; i < len; i++) {
            callback(data[i], i, data);
        }
    } else {
        for (let i in data) {
            callback(data[i], i);
        }
    }
};

module.exports = each;