'use strict';

/**
 * 原生模板语法规则
 */
var nativeRule = {
    test: /<%(#?)((?:==|=#|[=-])?)([\w\W]*?)(-?)%>/,
    use: function use(match, comment, output, code /*, trimMode*/) {

        output = {
            '-': 'raw',
            '=': 'escape',
            '': false,
            // v3 compat: raw output
            '==': 'raw',
            '=#': 'raw'
        }[output];

        // ejs compat: comment tag
        if (comment) {
            code = '/*' + match + '*/';
            output = false;
        }

        // ejs compat: trims following newline
        // if (trimMode) {}

        return {
            code: code,
            output: output
        };
    }
};

module.exports = nativeRule;