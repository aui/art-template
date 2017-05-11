/**
 * 模板错误处理类
 */

function TemplateError(error) {
    const that = Error.call(this, error.message);
    that.name = 'TemplateError';
    that.message = debugMessage(error);

    if (Error.captureStackTrace) {
        Error.captureStackTrace(that, that.constructor);
    }
    return that;
};

TemplateError.prototype = Object.create(Error.prototype);
TemplateError.prototype.constructor = TemplateError;

function debugMessage({
    source,
    path,
    line,
    column,
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
        `${message}`
}


module.exports = TemplateError;