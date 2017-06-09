/**
 * 模板错误处理类
 * @param   {Object}    options
 */
class TemplateError extends Error {
    constructor(options) {
        super(options.message);
        this.name = 'TemplateError';
        this.message = formatMessage(options);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
};

function formatMessage({
    name,
    source,
    path,
    line,
    column,
    generated,
    message
}) {

    if (!source) {
        return message;
    }

    const lines = source.split(/\n/);
    const start = Math.max(line - 3, 0)
    const end = Math.min(lines.length, line + 3);

    // Error context
    const context = lines.slice(start, end).map((code, index) => {
        const number = index + start + 1;
        const left = number === line ? ' >> ' : '    ';
        return `${left}${number}| ${code}`;
    }).join('\n');

    // Alter exception message
    return `${path || 'anonymous'}:${line}:${column}\n` +
        `${context}\n\n` +
        `${name}: ${message}` +
        (generated ? `\n   generated: ${generated}` : '')
}


module.exports = TemplateError;