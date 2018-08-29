const assert = require('assert');
const tplTokenizer = require('../../src/compile/tpl-tokenizer');

module.exports = {
    'type & value': {
        [tplTokenizer.TYPE_STRING]: () => {
            const result = tplTokenizer('value', []);
            assert.deepEqual(
                [
                    {
                        type: tplTokenizer.TYPE_STRING,
                        value: 'value',
                        line: 0,
                        start: 0,
                        end: 5,
                        script: null
                    }
                ],
                result
            );
        },

        [tplTokenizer.TYPE_EXPRESSION]: () => {
            const rule = {
                test: /<%([\w\W]*?)%>/,
                use: (match, code) => {
                    return {
                        code,
                        output: false
                    };
                }
            };
            const result = tplTokenizer('<%value%>', [rule]);
            assert.deepEqual(
                [
                    {
                        type: tplTokenizer.TYPE_EXPRESSION,
                        value: '<%value%>',
                        line: 0,
                        start: 0,
                        end: 9,
                        script: {
                            code: 'value',
                            output: false
                        }
                    }
                ],
                result
            );
        },

        [tplTokenizer.TYPE_STRING + ' & ' + tplTokenizer.TYPE_EXPRESSION]: () => {
            const rule = {
                test: /<%([\w\W]*?)%>/,
                use: (match, code) => {
                    return {
                        code,
                        output: false
                    };
                }
            };
            const result = tplTokenizer('hello, <%value%>', [rule]);
            assert.deepEqual(
                [
                    {
                        type: tplTokenizer.TYPE_STRING,
                        value: 'hello, ',
                        line: 0,
                        start: 0,
                        end: 7,
                        script: null
                    },
                    {
                        type: tplTokenizer.TYPE_EXPRESSION,
                        value: '<%value%>',
                        line: 0,
                        start: 7,
                        end: 16,
                        script: {
                            code: 'value',
                            output: false
                        }
                    }
                ],
                result
            );
        }
    },

    'line & start & end': {
        'check that the values are correct': () => {
            let result;
            const rules = [
                {
                    test: /<%([\w\W]*?)%>/,
                    use: (match, code) => {
                        return {
                            code,
                            output: false
                        };
                    }
                },
                {
                    test: /\${([\w\W]*?)}/,
                    use: (match, code) => {
                        return {
                            code,
                            output: 'escape'
                        };
                    }
                }
            ];

            result = tplTokenizer('hello,\n <%value%>', rules);
            assert.deepEqual(
                [
                    {
                        type: tplTokenizer.TYPE_STRING,
                        value: 'hello,\n ',
                        line: 0,
                        start: 0,
                        end: 8,
                        script: null
                    },
                    {
                        type: tplTokenizer.TYPE_EXPRESSION,
                        value: '<%value%>',
                        line: 1,
                        start: 1,
                        end: 10,
                        script: {
                            code: 'value',
                            output: false
                        }
                    }
                ],
                result
            );

            result = tplTokenizer('hello,\n <%\nvalue\n%>\nxx${abc}', rules);
            assert.deepEqual(
                [
                    {
                        type: tplTokenizer.TYPE_STRING,
                        value: 'hello,\n ',
                        line: 0,
                        start: 0,
                        end: 8,
                        script: null
                    },
                    {
                        type: tplTokenizer.TYPE_EXPRESSION,
                        value: '<%\nvalue\n%>',
                        line: 1,
                        start: 1,
                        end: 12,
                        script: {
                            code: '\nvalue\n',
                            output: false
                        }
                    },
                    {
                        type: tplTokenizer.TYPE_STRING,
                        value: '\nxx',
                        line: 3,
                        start: 2,
                        end: 5,
                        script: null
                    },
                    {
                        type: tplTokenizer.TYPE_EXPRESSION,
                        value: '${abc}',
                        line: 4,
                        start: 2,
                        end: 8,
                        script: {
                            code: 'abc',
                            output: 'escape'
                        }
                    }
                ],
                result
            );
        }
    }
};
