/**
 * 获取合并了默认配置的选项（支持拷贝原型属性）
 * @param {Object} options 
 * @param {Object} defaults 
 * @returns {Object}
 */
const getOptions = (options, defaults) => {
    const config = deepClone(defaults);

    for (let name in options) {
        config[name] = deepClone(options[name]);
    }

    return config;
};


const deepClone = (object) => {
    if (typeof object === 'object' && object !== null) {
        if (Array.isArray(object)) {
            const clone = [];
            object.forEach((value, index) => {
                clone[index] = deepClone(value);
            });
            return clone;
        } else {
            const clone = {};
            for (let name in object) {
                clone[name] = deepClone(object[name]);
            }
            return clone;
        }
    } else {
        return object;
    }
};


module.exports = getOptions;