/**
 * 调试器
 * @param   {Object} error 
 * @returns {string}
 */
const debug = error => {
    let output = `Template Error`;
    const message = JSON.stringify(error, null, 2);

    if (typeof console === 'object') {
        console.error(`${output}:`, message);
    }

    return () => `{${output}}`;
};

module.exports = debug;