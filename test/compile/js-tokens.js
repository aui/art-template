const assert = require('assert');
const jsTokens = require('../../src/compile/js-tokens');


describe('#js-tokens', () => {



    describe('parser', () => {

        const test = (code, result) => {
            it(code, () => {
                assert.deepEqual(result, jsTokens.parser(code));
            });
        };

        test('var', [{
            type: 'keyword',
            value: 'var'
        }]);

        test('0.99', [{
            type: 'number',
            value: '0.99'
        }]);

        test('a.b.c+d', [{
            type: 'name',
            value: 'a'
        }, {
            type: 'punctuator',
            value: '.'
        }, {
            type: 'name',
            value: 'b'
        }, {
            type: 'punctuator',
            value: '.'
        }, {
            type: 'name',
            value: 'c'
        }, {
            type: 'punctuator',
            value: '+'
        }, {
            type: 'name',
            value: 'd'
        }]);

        test('if a + b === 0', [{
            type: 'keyword',
            value: 'if'
        }, {
            type: 'whitespace',
            value: ' '
        }, {
            type: 'name',
            value: 'a'
        }, {
            type: 'whitespace',
            value: ' '
        }, {
            type: 'punctuator',
            value: '+'
        }, {
            type: 'whitespace',
            value: ' '
        }, {
            type: 'name',
            value: 'b'
        }, {
            type: 'whitespace',
            value: ' '
        }, {
            type: 'punctuator',
            value: '==='
        }, {
            type: 'whitespace',
            value: ' '
        }, {
            type: 'number',
            value: '0'
        }]);
    });



    describe('namespaces', () => {

        const getNamespaces = code => jsTokens.namespaces(jsTokens.parser(code));
        const test = (code, result) => {
            it(code, () => {
                assert.deepEqual(result, getNamespaces(code));
            });
        };

        test('var', []);
        test('var a', ['a']);
        test('a', ['a']);
        test('a.b', ['a']);
        test('a.b;c', ['a', 'c']);
        test('a.b\nd', ['a', 'd']);
        test('0.99 + a', ['a']);
        test('0.99 + a + b.c', ['a', 'b']);
        test('a /*.*/. b /**/; c', ['a', 'c']);
        test('a ".b.c; d;" /*e*/ f', ['a', 'f']);

    });



    describe('is-output-expression', () => {

        const test = (code, result) => {
            it(code, () => {
                assert.deepEqual(result, jsTokens.isOutputExpression(jsTokens.parser(code)));
            });
        };

        test('value', true);
        test('value + a', true);
        test('value + 2', true);
        test('3 + value + 2.3', true);
        test('value;', true);
        test('value ? a : b', true);
        test('value ? a : b ? c : d + 9.9', true);
        test('if (value) {', false);
        test('if (value) { ', false);
        test('list.each(function() {', false);
        test('list.each(function() { ', false);
    });

});