/**
 * 调试器
 * @param   {Object} error 
 * @returns {string}
 */
const debug = error => {

    if (typeof console === 'object') {
        console.error(`Template Error:`, error);
    }

    return () => `{Template Error}`;
};

module.exports = debug;