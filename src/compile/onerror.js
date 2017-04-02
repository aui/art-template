/**
 * 错误事件处理器
 * @param   {Object} error 
 * @returns {string}
 */
const onerror = error => {
    var message = 'Template Error\n\n';
    for (var name in error) {
        message += '<' + name + '>\n' + error[name] + '\n\n';
    }

    if (typeof console === 'object') {
        console.error(message);
    }

    return () => '{Template Error}';
};

module.exports = onerror;