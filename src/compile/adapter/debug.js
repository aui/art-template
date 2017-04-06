/**
 * 调试器
 * @param   {Object} error 
 * @returns {string}
 */
const debug = error => {

    if (typeof console === 'object') {
        console.error(`Template Error:`, JSON.stringify(error, null, 2));
    }

    return () => `{Template Error}`;
};

module.exports = debug;