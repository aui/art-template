'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * 模板错误处理类
 */
var TemplateError = function (_Error) {
    _inherits(TemplateError, _Error);

    function TemplateError(error) {
        _classCallCheck(this, TemplateError);

        var _this = _possibleConstructorReturn(this, _Error.call(this, error));

        var message = error.message;

        if (TemplateError.debugTypes[error.name]) {

            if (error.source) {
                message = TemplateError.debug(error);
            }

            _this.path = error.path;
        }

        _this.name = 'TemplateError';
        _this.message = message;
        return _this;
    }

    TemplateError.debug = function debug(error) {
        var source = error.source,
            path = error.path,
            line = error.line,
            column = error.column;


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
        return (path || 'anonymous') + ':' + line + ':' + column + '\n' + (context + '\n\n') + ('' + error.message);
    };

    return TemplateError;
}(Error);

;

TemplateError.debugTypes = {
    'RuntimeError': true,
    'CompileError': true
};

module.exports = TemplateError;