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
            console.warn(`${options.filename || 'anonymous'}:${match.line + 1}:${match.start + 1}\n` +
                `Template upgrade: {{${oldSyntax}}} -> {{${newSyntax}}}`);
        };



        // v3 compat: #value
        if (raw === '#') {
            warn('#value', '@value');
        }



        switch (key) {

            case 'set':

                code = `var ${values.join('').trim()}`;
                break;

            case 'if':

                code = `if(${values.join('').trim()}){`;

                break;

            case 'else':

                const indexIf = values.indexOf('if');

                if (~indexIf) {
                    values.splice(0, indexIf + 1);
                    code = `}else if(${values.join('').trim()}){`;
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

            case 'block':

                code = `block(${values.join('').trim()},function(){`;
                break;

            case '/block':

                code = '})';
                break;

            case 'echo':
                key = 'print';
                warn('echo value', 'value');
            case 'print':
            case 'include':
            case 'extend':

                if (values.join('').trim().indexOf('(') !== 0) {
                    // 执行函数省略 `()` 与 `,`
                    group = artRule._split(esTokens);
                    group.shift();
                    code = `${key}(${group.join(',')})`;
                    break;
                }

            default:

                if (~values.indexOf('|')) {

                    // 解析过滤器
                    const v3split = ':'; // ... v3 compat ...

                    // 将过滤器解析成二维数组
                    const group = esTokens.reduce((group, token) => {
                        const {value} = token;
                        if (value === '|') {
                            group.push([]);
                        } else if (/^\S+$/.test(value)) {
                            if (!group.length) {
                                group.push([]);
                            }
                            if (value === v3split && group[group.length - 1].length === 1) {
                                warn('value | filter: argv', 'value | filter argv');
                            } else {
                                group[group.length - 1].push(token);
                            }
                        }
                        return group;
                    }, []).map(g => artRule._split(g));

                    // 将过滤器管道化
                    code = group.reduce((accumulator, filter) => {
                        const name = filter.shift();
                        filter.unshift(accumulator);
                        return `$imports.${name}(${filter.join(',')})`;
                    }, group.shift().join(` `).trim());


                }

                output = output || 'escape';

                break;
        }


        result.code = code;
        result.output = output;


        return result;
    },


    // 将多个 javascript 表达式拆分成组
    // 支持基本运算、三元表达式、取值、运行函数
    // 只支持 string、number、boolean、null、undefined 这几种类型声明，不支持 function、object、array
    _split: esTokens => {

        esTokens = esTokens.filter(({
            type
        }) => {
            return type !== `whitespace` && type !== `comment`;
        });

        let current = 0;
        let lastToken = esTokens.shift();
        const punctuator = `punctuator`;
        const close = /\]|\)/;
        const group = [
            [lastToken]
        ];

        while (current < esTokens.length) {
            const esToken = esTokens[current];

            if (esToken.type === punctuator || lastToken.type === punctuator && !close.test(lastToken.value)) {
                group[group.length - 1].push(esToken);
            } else {
                group.push([esToken]);
            }

            lastToken = esToken;

            current++;
        }

        return group.map(g => g.map(g => g.value).join(``));
    }
};


module.exports = artRule;