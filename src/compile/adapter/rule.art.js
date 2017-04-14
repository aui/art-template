const nativeRule = {
    test: /{{([@#]?)(\/?)([\w\W]*?)}}/,
    use: function (match, raw, close, code) {
        
        const compiler = this;
        const options = compiler.options;
        const esTokens = compiler.getEsTokens(code.trim());
        const result = {};
        const values = esTokens
            .map(token => token.value)
            .filter(value => !/^\s+$/.test(value));

        let group;
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
                // value.sub + 1
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
                // object value.list index

                // ... v3 compat ...
                // object 'as' value
                // object 'as' value index
                group = split(esTokens);
                group.shift();

                if (group[1] === 'as') {
                    upgrade('each object as value index', 'each object value index');
                    group.splice(1, 1);
                }

                const object = group[0] || '$data';
                const value = group[1] || '$value';
                const index = group[2] || '$index';

                code = `$each(${object},function(${value},${index}){`;

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
                upgrade('echo value', 'value');

            case 'print':
            case 'include':

                // print value
                // print value value2 value3
                // include './header'
                // include './header' context
                // include(name + '.html', context)
                group = split(esTokens);
                group.shift();
                code = `${key}(${group.join(',')});`;
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
                        return code = `${name}(${filter.join(',')})`;
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



// 按照空格分组
const split = (esTokens) => {
    let current = 0;
    let lastToken = esTokens.shift();
    const group = [
        [lastToken]
    ];

    while (current < esTokens.length) {
        const esToken = esTokens[current];
        const esTokenType = esToken.type;

        if (esTokenType === `whitespace` || esTokenType === `comment`) {
            current++;
            continue;
        } else if (lastToken.type === 'punctuator' && lastToken.value !== ']' || esTokenType === 'punctuator') {
            group[group.length - 1].push(esToken);
        } else {
            group.push([esToken]);
        }

        lastToken = esToken;
        current++;
    }

    return group.map(g => g.map(g => g.value).join(''));
};


// mocha use
nativeRule._split = split;


module.exports = nativeRule;