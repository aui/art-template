/**
 * 设置简洁的模板语法
 * @param {Object} options 
 */
const bindSyntax = (options = {}) => {

    options.openTag = '{{';
    options.closeTag = '}}';
    options.rawSymbol = '@';

    options.imports.$each = (data, callback) => {
        if (Array.isArray(data)) {
            for (let i = 0, len = data.length; i < len; i++) {
                callback(data[i], i, data);
            }
        } else {
            for (let i in data) {
                callback(data[i], i);
            }
        }
    };


    options.parser = (code, options, tokens, addContext) => {

        const upgrade = (oldSyntax, newSyntax) => {
            console.warn('Template Upgrade:',
                `{{${oldSyntax}}}`, `>>>`, `{{${newSyntax}}}`,
                `\n`, options.filename || '');
        };

        const escapeSymbol = options.escapeSymbol;
        const rawSymbol = options.rawSymbol;
        const values = tokens.map(token => token.value);


        // v3 compat: #value
        if (values[0] === '#') {
            upgrade('#value', '@value');
            values[0] = values[0].replace(/^#/, rawSymbol);
        }

        const raw = values[0] === rawSymbol ? values.shift() : '';
        const close = values[0] === '/' ? values.shift() : '';
        const key = close + values[0];

        const move = index => {
            values.splice(0, index + 1);
            return values.join('');
        };

        const call = name => {
            values.splice(0, 2);
            const args = values.map((value) => /^s+$/.test(value) ? ',' : value);
            addContext(name);
            return `${name}(${args});`;
        };

        switch (key) {

            case 'set':
                // set value = 0
                code = `var ${move(1)};`;
                break;

            case 'if':

                // if value
                code = `if(${move(1)}){`;
                break;

            case 'else':


                if (values[2] === 'if') {
                    // else if value
                    code = `}else if(${move(3)}){`;
                } else {
                    // else
                    code = `}else{`;
                }

                break;

            case '/if':

                // /if
                code = '}';
                break;

            case 'each':

                // each
                // each object
                // each object value
                // each object value index

                // ... v3 compat ...
                // each object 'as' value
                // each object 'as' value index
                if (values[4] === 'as') {
                    upgrade('each object \'as\' value index', 'each object value index');
                    values.splice(4, 2);
                }

                const object = values[2] || '$data';
                const value = values[6] || '$value';
                const index = values[8] || '$index';

                code = `$each(${object},function(${value},${index}){`;
                addContext('$each');

                break;

            case '/each':

                // /each
                code = '});';
                break;

            case 'echo':

                // echo value
                // echo value value2 value3
                code = call('print');
                break;

            case 'print':
            case 'include':

                // print value
                // print value value2 value3
                // include './header'
                // include './header' context
                code = call(key);;
                break;

            default:

                if (values.indexOf('|') !== -1) {

                    // value | filter
                    // value|filter
                    // value | filter 'string'
                    // value | filter arg1 arg2 arg3
                    // value | filter1 arg1 | filter2 | filter3
                    // >>> $imports.filter3($imports.filter2($imports.filter1(value, arg1)))

                    // ... v3 compat ...
                    // value | filter1:'abcd' | filter2

                    let current = [];
                    const group = [];
                    const output = values.shift();

                    values.filter(v => !/^\s+$|:/.test(v)).forEach(value => {
                        if (value === '|') {
                            current = [];
                            group.push(current);
                        } else {
                            current.push(value);
                        }
                    });

                    // [['filter1'], ['filter2'], ['filter3', 'arg1', 'arg2']]
                    // >>> $imports.filter3($imports.filter2($imports.filter1()), 'arg1', 'arg2')
                    group.reduce((accumulator, filter) => {
                        const name = filter.shift();
                        filter.unshift(accumulator);
                        return code = `$imports.${name}(${filter.join(',')})`;
                    }, output);


                } else if (options.imports[key]) {

                    // ... v3 compat ...
                    // helperName value
                    upgrade('filterName value', 'value | filterName');
                    code = rawSymbol + call(key);

                } else {

                    // value
                    code = (raw ? rawSymbol : escapeSymbol) + code;
                }

                break;
        }


        return code;
    };

    return options;
};

module.exports = bindSyntax;