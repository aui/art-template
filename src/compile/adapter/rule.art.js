/**
 * 简洁模板语法规则
 */
const artRule = {
    test: /{{[ \t]*([@#]?)(\/?)([\w\W]*?)[ \t]*}}/,
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
        const warn = (oldSyntax, newSyntax) => {
            console.warn('Template upgrade:',
                `{{${oldSyntax}}}`, `>>>`, `{{${newSyntax}}}`,
                `\n`, options.filename || '');
        };



        // v3 compat: #value
        if (raw === '#') {
            warn('#value', '@value');
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

                group = artRule._split(esTokens);
                group.shift();

                if (group[1] === 'as') {
                    // ... v3 compat ...
                    warn('each object as value index', 'each object value index');
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
                warn('echo value', 'value');

            case 'print':
            case 'include':
            case 'extend':

                group = artRule._split(esTokens);
                group.shift();
                code = `${key}(${group.join(',')})`;
                break;

            case 'block':

                code = `block(${values.join('')},function(){`;
                break;

            case '/block':

                code = '})';
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
                        return code = `$imports.${name}(${filter.join(',')})`;
                    }, target);


                } else if (options.imports[key]) {

                    // ... v3 compat ...
                    warn('filterName value', 'value | filterName');

                    group = artRule._split(esTokens);
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
    },

    // 根据语义以空格进行切割
    _split: (esTokens) => {
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
    }
};


module.exports = artRule;