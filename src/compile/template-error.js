/**
 * 模板错误处理类
 */
function TemplateError(error) {
    const STRIP_FILENAME_RE = /^[^:]+: /;
    const stack = error.stack.replace(STRIP_FILENAME_RE, ``);
    delete error.stack;

    error = JSON.stringify(error, null, 4);

    this.name = 'TemplateError';
    this.message = error;
    this.stack = stack;
}

TemplateError.prototype = Object.create(Error.prototype);
TemplateError.prototype.constructor = TemplateError;

module.exports = TemplateError;