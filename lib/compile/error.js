'use strict';

/**
 * 模板错误处理类
 */

function TemplateError(error) {
    var that = Error.call(this, error.message);
    that.name = 'TemplateError';
    that.message = debugMessage(error);

    if (Error.captureStackTrace) {
        Error.captureStackTrace(that, that.constructor);
    }
    return that;
};

TemplateError.prototype = Object.create(Error.prototype);
TemplateError.prototype.constructor = TemplateError;

function debugMessage(_ref) {
    var source = _ref.source,
        path = _ref.path,
        line = _ref.line,
        column = _ref.column,
        message = _ref.message;


    if (!source) {
        return message;
    }

    var lines = source.split(/\n/);
    var start = Math.max(line - 3, 0);
    var end = Math.min(lines.length, line + 3);

    // Error context
    var context = lines.slice(start, end).map(function (code, index) {
        var number = index + start + 1;
        var left = number === line ? ' >> ' : '    ';
        return '' + left + number + '| ' + code;
    }).join('\n');

    // Alter exception message
    return (path || 'anonymous') + ':' + line + ':' + column + '\n' + (context + '\n\n') + ('' + message);
}

module.exports = TemplateError;