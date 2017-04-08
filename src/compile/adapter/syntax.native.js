const syntax = {

    name: 'EVAL',
    open: '<%',
    close: '%>',
    escape: '=',
    raw: '-',

    parser: ({ tplToken }) => {

        let code = tplToken.code;


        if (/^=[=#]/.test(code)) {
            // ... v3 compat ...
            tplToken.output = 'RAW';
        }

        if (tplToken.output) {

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