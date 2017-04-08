const syntax = {

    name: 'EVAL',
    open: '<%',
    close: '%>',
    escape: '=',
    raw: '-',

    parser: ({ tplToken }) => {

        let code = tplToken.code;

        if (tplToken.output) {

            if (/^[=#]/.test(code)) {
                // ... v3 compat ...
                code = code.replace(/^[=#]/, '');
                tplToken.output = 'RAW';
            }

            // ... ejs compat ...
            code = code.replace(/-$/, '');

        } else {

            // ... ejs compat ...
            code = code.replace(/^#/, '//');
        }

        tplToken.code = code;

        return tplToken;
    }
};

module.exports = syntax;