const defaults = require('./compile/defaults');

/**
 * 绑定超级模板语法
 * @param {Object} options 
 */
const bindSyntax = (options = defaults) => {

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


    options.parser = ({ tokens, line, source, compiler }) => {

        const options = compiler.options;

        // 旧版语法升级提示
        const upgrade = (oldSyntax, newSyntax) => {
            console.warn('Template upgrade example:',
                `{{${oldSyntax}}}`, `>>>`, `{{${newSyntax}}}`,
                `\n`, options.filename || '', `${line}:0-${source.length}`);
        };

        const escapeSymbol = options.escapeSymbol;
        const rawSymbol = options.rawSymbol;
        const values = tokens.map(token => token.value).filter(value => /^\S+$/.test(value));


        // v3 compat: #value
        if (values[0] === '#') {
            upgrade('#value', '@value');
            values[0] = values[0].replace(/^#/, rawSymbol);
        }


        // 输出标志
        let code = '';
        let inputSymbol = values[0] === rawSymbol ? values.shift() : escapeSymbol;


        const close = values[0] === '/' ? values.shift() : '';
        const key = close + values.shift();

        switch (key) {

            case '%':

                // % for (var i = 0; i < data.length; i++){} %
                tokens.shift();

                if (tokens[tokens.length - 1] === key) {
                    tokens.pop();
                }

                code = tokens.join('');
                break;

            case 'set':

                // value = 0
                code = `var ${values.join('')};`;
                break;

            case 'if':

                // value
                // value + 1
                code = `if(${values.join('')}){`;
                break;

            case 'else':

                if (values[0] === 'if') {
                    // if value
                    values.shift();
                    code = `}else if(${values.join('')}){`;
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

                // 
                // object
                // object value
                // object value index

                // ... v3 compat ...
                // object 'as' value
                // object 'as' value index
                if (values[1] === 'as') {
                    upgrade('each object \'as\' value index', 'each object value index');
                    values.splice(1, 1);
                }

                const object = values[0] || '$data';
                const value = values[1] || '$value';
                const index = values[2] || '$index';

                code = `$each(${object},function(${value},${index}){`;
                compiler.addContext('$each');

                break;

            case '/each':

                // /each
                code = '});';
                break;

            case 'echo':

                // echo value
                // echo value value2 value3
                // echo(value + 1, value2)
                code = `print(${values.join(',')});`;
                break;

            case 'print':
            case 'include':

                // print value
                // print value value2 value3
                // include './header'
                // include './header' context
                // include(name + '.html', context)
                code = `${key}(${values.join(',')});`;
                break;

            default:

                if (values.indexOf('|') !== -1) {

                    // 解析过滤器
                    // value | filter
                    // value|filter
                    // value | filter 'string'
                    // value | filter arg1 arg2 arg3
                    // value | filter1 arg1 | filter2 | filter3
                    // value * 1000 | filter
                    // value[key] | filter
                    // value1 || value2 | filter

                    // ... v3 compat ...
                    // value | filter1:'abcd' | filter2

                    let target = key;
                    const group = [];
                    const v3split = ':';

                    // 找到要过滤的目标表达式
                    // values => ['value', '[', 'key', ']', '|', 'filter1', '|', 'filter2', 'argv1', 'argv2']
                    // target => `value[key]`
                    while (values[0] !== '|') target += values.shift();


                    // 将过滤器解析成二维数组
                    // group => [['filter1'], [['filter2', 'argv1', 'argv2']]
                    values.filter(v => v !== v3split).forEach(value => {
                        if (value === '|') {
                            group.push([]);
                        } else {
                            group[group.length - 1].push(value);
                        }
                    });


                    // 将过滤器管道化
                    // code => `$imports.filter2($imports.filter1(value[key]),argv1,argv2)`
                    group.reduce((accumulator, filter) => {
                        const name = filter.shift();
                        filter.unshift(accumulator);
                        return code = `$imports.${name}(${filter.join(',')})`;
                    }, target);


                } else if (options.imports[key]) {

                    // ... v3 compat ...
                    // helperName value
                    upgrade('filterName value', 'value | filterName');
                    code = `${key}(${values.join(',')})`;
                    inputSymbol = rawSymbol;

                }

                // value
                code = inputSymbol + code;

                break;
        }


        return code;
    };

    return options;
};

module.exports = bindSyntax;