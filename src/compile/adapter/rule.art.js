const nativeRule = {
    test: /{{([@#]?)(\/?)([\w\W]*?)}}/,
    use: function (match, raw, close, code) {

        const compiler = this;
        const options = compiler.options;
        const esTokens = compiler.getEsTokens(code.trim());
        const values = esTokens.map(token => token.value);
        const result = {};


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

                code = `var ${values.join('')}`;
                break;

            case 'if':

                code = `if(${values.join('')}){`;

                break;

            case 'else':

                const indexIf = values.indexOf('if');
                
                if (indexIf > -1) {
                    values.splice(0, indexIf + 1);
                    code = `}else if(${values.join('')}){`;
                } else {
                    code = `}else{`;
                }

                break;

            case '/if':

                code = '}';
                break;

            case 'each':

                group = split(esTokens);
                group.shift();

                if (group[1] === 'as') {
                    // ... v3 compat ...
                    upgrade('each object as value index', 'each object value index');
                    group.splice(1, 1);
                }

                const object = group[0] || '$data';
                const value = group[1] || '$value';
                const index = group[2] || '$index';

                code = `$each(${object},function(${value},${index}){`;

                break;

            case '/each':

                code = '})';
                break;

            case 'echo':

                key = 'print';
                upgrade('echo value', 'value');

            case 'print':
            case 'include':

                group = split(esTokens);
                group.shift();
                code = `${key}(${group.join(',')})`;
                break;

            default:

                if (values.indexOf('|') !== -1) {

                    // 解析过滤器

                    let target = key;
                    const group = [];
                    const v3split = ':'; // ... v3 compat ...
                    const list = values.filter(value => !/^\s+$/.test(value));

                    // 找到要过滤的目标表达式
                    while (list[0] !== '|') target += list.shift();


                    // 将过滤器解析成二维数组
                    list.filter(v => {
                        return v !== v3split;
                    }).forEach(value => {
                        if (value === '|') {
                            group.push([]);
                        } else {
                            group[group.length - 1].push(value);
                        }
                    });


                    // 将过滤器管道化
                    group.reduce((accumulator, filter) => {
                        const name = filter.shift();
                        filter.unshift(accumulator);
                        return code = `${name}(${filter.join(',')})`;
                    }, target);


                } else if (options.imports[key]) {

                    // ... v3 compat ...
                    upgrade('filterName value', 'value | filterName');

                    group = split(esTokens);
                    group.shift();

                    code = `${key}(${group.join(',')})`;
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

        if (esTokenType !== `whitespace` && esTokenType !== `comment`) {

            if (lastToken.type === `punctuator` && lastToken.value !== `]` || esTokenType === `punctuator`) {
                group[group.length - 1].push(esToken);
            } else {
                group.push([esToken]);
            }

            lastToken = esToken;
        }

        current++;
    }

    return group.map(g => g.map(g => g.value).join(``));
};


// mocha use
nativeRule._split = split;


module.exports = nativeRule;