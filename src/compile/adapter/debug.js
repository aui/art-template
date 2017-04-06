/**
 * 调试器
 * @param   {Object} error 
 * @returns {string}
 */
const debug = error => {
    let output = `Template Error`;

    // if (error.stack) {
    //     error.stack = error.stack.split(/\n/).splice(0, 3).join('\n');
    // }

    const message = JSON.stringify(error, null, 2);

    if (typeof console === 'object') {
        console.error(`${output}:`, message);
    }

    return () => `{${output}}`;
};

module.exports = debug;