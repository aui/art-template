/**
 * 模板错误处理类
 */
class TemplateError extends Error {

    constructor(error) {
        super(error);
        let message = error.message;

        if (TemplateError.debugTypes[error.name]) {

            if (error.source) {
                message = TemplateError.debug(error);
            }

            this.path = error.path;
        }

        this.name = 'TemplateError';
        this.message = message;
    }

    static debug(error) {
        const {
            source,
            path,
            line,
            column
        } = error;

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
            `${error.message}`
    }
};


TemplateError.debugTypes = {
    'RuntimeError': true,
    'CompileError': true
};


module.exports = TemplateError;