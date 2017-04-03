/**
 * 错误事件处理器
 * @param   {Object} error 
 * @returns {string}
 */
const onerror = error => {
    let output = `Template Error`;
    const message = JSON.stringify(error, null, 2);

    if (typeof console === 'object') {
        console.error(`${output}:`, message);
    }

    return () => `{${output}}`;
};

module.exports = onerror;