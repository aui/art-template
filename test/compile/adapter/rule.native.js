const assert = require('assert');
const ruleNative = require('../../../src/compile/adapter/rule.native');
const esTokenizer = require('../../../src/compile/es-tokenizer');

const callRule = code => {
    const compiler = {
        options: {},
        getEsTokens: esTokenizer
    };
    const list = code.match(ruleNative.test);
    list[0] = new String(list[0]);
    list[0].line = 0;
    list[0].start = 0;
    return ruleNative.use.apply(compiler, list);
};

module.exports = {
    syntax: {
        basic: () => {
            assert.deepEqual(
                {
                    code: 'if (value) {',
                    output: false
                },
                callRule(`<%if (value) {%>`)
            );

            assert.deepEqual(
                {
                    code: 'if (value) {',
                    output: false
                },
                callRule(`<% if (value) { %>`)
            );
        },
        comment: () => {
            assert.deepEqual(
                {
                    code: '/*if (value) {*/',
                    output: false
                },
                callRule(`<%#if (value) {%>`)
            );
        },
        trimMode: () => {
            assert.deepEqual(
                {
                    code: 'value',
                    output: false
                },
                callRule(`<%value-%>`)
            );
        }
    },

    output: {
        autoescape: () => {
            assert.deepEqual(
                {
                    code: 'value',
                    output: 'escape'
                },
                callRule(`<%=value%>`)
            );

            assert.deepEqual(
                {
                    code: 'value',
                    output: 'escape'
                },
                callRule(`<%= value %>`)
            );

            assert.deepEqual(
                {
                    code: 'typeof value',
                    output: 'escape'
                },
                callRule(`<%=typeof value%>`)
            );

            assert.deepEqual(
                {
                    code: 'value + 1',
                    output: 'escape'
                },
                callRule(`<%=value + 1%>`)
            );

            assert.deepEqual(
                {
                    code: 'value?a:b',
                    output: 'escape'
                },
                callRule(`<%=value?a:b%>`)
            );

            assert.deepEqual(
                {
                    code: 'value ? a : b',
                    output: 'escape'
                },
                callRule(`<%= value ? a : b %>`)
            );
        },
        raw: () => {
            assert.deepEqual(
                {
                    code: 'value',
                    output: 'raw'
                },
                callRule(`<%-value%>`)
            );

            assert.deepEqual(
                {
                    code: 'value',
                    output: 'raw'
                },
                callRule(`<%- value %>`)
            );
        }
    }
};
