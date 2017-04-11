const nativeRule = {
    test: /<%(#?)((?:==|=#|[=-])?)([\w\W]*?)(-?)%>/,
    use: (match, comment, output, code) => {

        const outputType = {
            '-': 'raw',
            '=': 'escape',
            '': false,
            // v3 compat: raw output
            '==': 'raw',
            '=#': 'raw',
        };

        // ejs compat: comment tag
        if (comment) {
            code = `//${code}`;
        }

        // ejs compat: trims following newline
        //if (trtimMode) {}

        return {
            code,
            output: outputType[output]
        };

    }
};


module.exports = nativeRule;