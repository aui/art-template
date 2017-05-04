const toString = Object.prototype.toString;
const toType = value => {
    // Null: 兼容 IE8
    return value === null ? 'Null' : toString.call(value).slice(8, -1);
};


/**
 * 快速继承默认配置
 * @param   {Object}    options
 * @param   {?Object}   defaults
 * @return  {Object}
 */
const extend = function (target, defaults) {
    let object;
    const type = toType(target);

    if (type === 'Object') {
        object = Object.create(defaults || {});
    } else if (type === 'Array') {
        object = [].concat(defaults || []);
    }

    if (object) {
        for (let index in target) {
            if (target.hasOwnProperty(index)) {
                object[index] = extend(target[index], object[index]);
            }
        }
        return object;
    } else {
        return target;
    }
};

module.exports = extend;