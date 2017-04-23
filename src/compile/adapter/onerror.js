/**
 * 调试器
 * @param   {Object}    error
 * @param   {?Object}   options
 * @return  {string}
 */
const onerror = (error/*, options*/) => {
    if (typeof console === 'object') {
        console.error(error.name, error.message);
    }
};

module.exports = onerror;