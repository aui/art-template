/**
 * 调试器
 * @param   {Object} error 
 * @return  {string}
 */
const onerror = error => {

    if (typeof console === 'object') {
        const stack = error.stack;
        delete error.stack;
        error = JSON.stringify(error, null, 4);
        console.error(`Template Error: ${error}\n\n${stack}`);
    }

    return () => `{Template Error}`;
};

module.exports = onerror;