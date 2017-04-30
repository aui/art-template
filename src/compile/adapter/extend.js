const toString = Object.prototype.toString;
const toType = value => {
    // ie8 兼容: Undefined | Null
    if (value === undefined) {
        return 'Undefined';
    } else if (value === null) {
        return 'Null';
    } else {
        return toString.call(value).slice(8, -1);
    }
};


/**
 * 继承
 * @param   {Object}    options
 * @param   {?Object}   defaults
 * @return  {Object}
 */
const extend = function (target, defaults = this) {
    let object;
    const type = toType(target);

    if (type === 'Undefined') {
        target = extend(defaults);
    } else if (type === 'Object') {
        object = Object.create(defaults || {});
    } else if (type === 'Array') {
        object = [].concat(defaults || []);
    }

    if (object) {
        for (let index in target) {
            object[index] = extend(target[index], defaults[index]);
        }
        return object;
    } else {
        return target;
    }
};


module.exports = extend;