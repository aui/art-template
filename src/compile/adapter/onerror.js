/**
 * 调试器
 * @param   {Object}    error
 * @param   {?Object}   options
 * @return  {function}
 */
const onerror = (error/*, options*/) => {

    if (typeof console === 'object') {
        console.error(error.name, error.message);
    }

    return () => `{Template Error}`;
};

module.exports = onerror;