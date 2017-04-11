const assert = require('assert');
const tplTokens = require('../../src/compile/tpl-tokens');

module.exports = {
    before: () => {
        console.log('#compile/tpl-tokens');
    },

    'type & value': {

        [tplTokens.TYPE_STRING]: () => {
            const result = tplTokens.parser('value', []);
            assert.deepEqual([{
                type: tplTokens.TYPE_STRING,
                value: 'value',
                line: 0,
                start: 0,
                end: 5
            }], result);
        },


        [tplTokens.TYPE_EXPRESSION]: () => {
            const rule = {
                test: /<%([\w\W]*?)%>/,
                use: (match, code) => {
                    return {
                        code,
                        output: false
                    };
                }
            };
            const result = tplTokens.parser('<%value%>', [rule]);
            assert.deepEqual([{
                type: tplTokens.TYPE_EXPRESSION,
                value: '<%value%>',
                line: 0,
                start: 0,
                end: 9,
                script: {
                    code: 'value',
                    output: false
                }
            }], result);
        },


        [tplTokens.TYPE_STRING + ' & ' + tplTokens.TYPE_EXPRESSION]: () => {
            const rule = {
                test: /<%([\w\W]*?)%>/,
                use: (match, code) => {
                    return {
                        code,
                        output: false
                    };
                }
            };
            const result = tplTokens.parser('hello, <%value%>', [rule]);
            assert.deepEqual([{
                type: tplTokens.TYPE_STRING,
                value: 'hello, ',
                line: 0,
                start: 0,
                end: 7
            }, {
                type: tplTokens.TYPE_EXPRESSION,
                value: '<%value%>',
                line: 0,
                start: 7,
                end: 16,
                script: {
                    code: 'value',
                    output: false
                }
            }], result);
        }
    },

    'line & start & end': {
        'check that the values are correct': () => {
            let result;
            const rules = [{
                test: /<%([\w\W]*?)%>/,
                use: (match, code) => {
                    return {
                        code,
                        output: false
                    };
                }
            }, {
                test: /\${([\w\W]*?)}/,
                use: (match, code) => {
                    return {
                        code,
                        output: 'escape'
                    };
                }
            }];


            result = tplTokens.parser('hello,\n <%value%>', rules);
            assert.deepEqual([{
                type: tplTokens.TYPE_STRING,
                value: 'hello,\n ',
                line: 0,
                start: 0,
                end: 8
            }, {
                type: tplTokens.TYPE_EXPRESSION,
                value: '<%value%>',
                line: 1,
                start: 1,
                end: 10,
                script: {
                    code: 'value',
                    output: false
                }
            }], result);

            result = tplTokens.parser('hello,\n <%\nvalue\n%>\nxx${abc}', rules);
            assert.deepEqual([{
                type: tplTokens.TYPE_STRING,
                value: 'hello,\n ',
                line: 0,
                start: 0,
                end: 8
            }, {
                type: tplTokens.TYPE_EXPRESSION,
                value: '<%\nvalue\n%>',
                line: 1,
                start: 1,
                end: 12,
                script: {
                    code: '\nvalue\n',
                    output: false
                }
            }, {
                type: tplTokens.TYPE_STRING,
                value: '\nxx',
                line: 3,
                start: 2,
                end: 5
            }, {
                type: tplTokens.TYPE_EXPRESSION,
                value: '${abc}',
                line: 4,
                start: 2,
                end: 8,
                script: {
                    code: 'abc',
                    output: 'escape'
                }
            }], result);
        }
    }
};