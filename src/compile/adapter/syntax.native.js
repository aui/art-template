const syntax = {

    name: 'EVAL',
    open: '<%',
    close: '%>',
    escape: '=',
    raw: '-',

    parser: ({ tokens }) => {

        let code = tokens.code;

        if (tokens.output) {

            if (/^[=#]/.test(code)) {
                // ... v3 compat ...
                code = code.replace(/^[=#]/, '');
                tokens.output = 'RAW';
            }

            // ... ejs compat ...
            code = code.replace(/-$/, '');

        } else {

            // ... ejs compat ...
            code = code.replace(/^#/, '//');
        }

        tokens.code = code;

        return tokens;
    }
};

module.exports = syntax;