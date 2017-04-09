const jsTokens = require('../js-tokens');
const nativeRule = {
    test: /{{([@#]?)(\/?)([\w\W]*?)}}/,
    use: ([raw, close, code], compiler) => {

        const tokens = jsTokens.parser(code);
        const options = compiler.options;
        const result = {};
        const values = tokens
            .map(token => token.value)
            .filter(value => !/^\s+$/.test(value));


        let output = raw ? 'raw' : false;
        let key = close + values.shift();


        // 旧版语法升级提示
        const upgrade = (oldSyntax, newSyntax) => {
            console.warn('Template upgrade example:',
                `{{${oldSyntax}}}`, `>>>`, `{{${newSyntax}}}`,
                `\n`, options.filename || '');
        };



        // v3 compat: #value
        if (raw === '#') {
            upgrade('#value', '@value');
        }



        switch (key) {

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
                    upgrade('each object as value index', 'each object value index');
                    values.splice(1, 1);
                }

                const object = values[0] || '$data';
                const value = values[1] || '$value';
                const index = values[2] || '$index';

                code = `$each(${object},function(${value},${index}){`;
                result.variables = [`$each`, object];

                break;

            case '/each':

                // /each
                code = '});';
                break;

            case 'echo':

                // echo value
                // echo value value2 value3
                // echo(value + 1, value2)
                key = 'print';
                upgrade('echo value', 'print value');

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
                    values.filter(v => {
                        return v !== v3split;
                    }).forEach(value => {
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
                    output = 'raw';

                } else {
                    code = `${key}${values.join('')}`;
                }


                if (!output) {
                    output = 'escape';
                }


                break;
        }


        result.code = code;
        result.output = output;

        return result;
    }
};



module.exports = nativeRule;