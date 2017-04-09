const nativeRule = {
    test: /<%([#=-]?)([=#]?)([\w\W]*?)(-?)%>/,
    use: ([output, raw, code]) => {

        const outputType = {
            '-': 'raw',
            '=': 'escape',
            '': false
        };

        // ejs compat: comment tag
        if (output === '#') {
            code = `//${code}`;
        }

        // v3 compat: raw output
        if (raw) {
            output = '-';
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