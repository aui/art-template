/**
 * 调试器
 * @param   {Object} error 
 * @returns {string}
 */
const debug = error => {

    if (typeof console === 'object') {
        const stack = error.stack;
        delete error.stack;
        console.error(`Template Error: ` + JSON.stringify(error, null, 4) + '\n\n' + stack);
    }

    return () => `{Template Error}`;
};

module.exports = debug;