/**
 * 调试器
 * @param   {Object}    error
 * @param   {?Object}   options
 * @return  {string}
 */
const onerror = (error /*, options*/) => {
    console.error(error.name, error.message);
};

module.exports = onerror;
