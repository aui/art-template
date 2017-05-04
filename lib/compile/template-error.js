'use strict';

/**
 * 模板错误处理类
 */
function TemplateError(error) {
    var stack = error.stack;
    delete error.stack;
    this.name = 'TemplateError';
    this.message = JSON.stringify(error, null, 4);
    this.stack = stack;
}

TemplateError.prototype = Object.create(Error.prototype);
TemplateError.prototype.constructor = TemplateError;

module.exports = TemplateError;