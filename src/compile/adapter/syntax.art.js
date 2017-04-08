const syntax = {

    name: 'BASIC',
    open: '{{',
    close: '}}',
    escape: '',
    raw: '@',

    parser: ({ tplToken, jsToken, compiler }) => {

        const source = tplToken.value;
        const options = compiler.options;
        const line = tplToken.line;

        // 旧版语法升级提示
        const upgrade = (oldSyntax, newSyntax) => {
            console.warn('Template upgrade example:',
                `{{${oldSyntax}}}`, `>>>`, `{{${newSyntax}}}`,
                `\n`, options.filename || '', `${line}:0-${source.length}`);
        };

        const values = jsToken.map(token => token.value).filter(value => !/^\s+$/.test(value));


        // v3 compat: #value
        if (values[0] === '#') {
            upgrade('#value', '@value');
            values[0] = values[0].replace(/^#/, '');
            tplToken.output = 'RAW';
        }


        let code = '';


        const close = values[0] === '/' ? values.shift() : '';
        let key = close + values.shift();

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
                    upgrade('each object \'as\' value index', 'each object value index');
                    values.splice(1, 1);
                }

                const object = values[0] || '$data';
                const value = values[1] || '$value';
                const index = values[2] || '$index';

                code = `$each(${object},function(${value},${index}){`;
                compiler.importContext('$each');

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

            case 'print':
            case 'include':

                // print value
                // print value value2 value3
                // include './header'
                // include './header' context
                // include(name + '.html', context)
                code = `${key}(${values.join(',')});`;
                compiler.importContext(key);
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
                    tplToken.output = 'RAW';

                } else {
                    code = `${key}${values.join('')}`;
                }


                if (tplToken.output !== 'RAW') {
                    tplToken.output = 'ESCAPE';
                }


                break;
        }


        tplToken.code = code;

        return tplToken;
    }
};


module.exports = syntax;