/**
 * 原生模板语法规则
 */
const nativeRule = {
    test: /<%(#?)((?:==|=#|[=-])?)[ \t]*([\w\W]*?)[ \t]*(-?)%>/,
    use: (match, comment, output, code/*, trimMode*/) => {

        output = ({
            '-': 'raw',
            '=': 'escape',
            '': false,
            // v3 compat: raw output
            '==': 'raw',
            '=#': 'raw',
        })[output];

        // ejs compat: comment tag
        if (comment) {
            code = `/*${code}*/`;
            output = false;
        }

        // ejs compat: trims following newline
        // if (trimMode) {}

        return {
            code,
            output
        };

    }
};


module.exports = nativeRule;