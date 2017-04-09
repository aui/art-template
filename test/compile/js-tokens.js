const assert = require('assert');
const jsTokens = require('../../src/compile/js-tokens');


describe('#compile/js-tokens', () => {



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

        test('"value"', [{
            type: 'string',
            value: '"value"',
            closed: true
        }]);

        test('/*value*/', [{
            type: 'comment',
            value: '/*value*/',
            closed: true
        }]);

        test('#', [{
            type: 'invalid',
            value: '#'
        }]);

        test('@', [{
            type: 'invalid',
            value: '@'
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

        test('@if a + b === 0', [{
            type: 'invalid',
            value: '@'
        }, {
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



    describe('getVariables', () => {

        const getvariables = code => jsTokens.getVariables(jsTokens.parser(code));
        const test = (code, result) => {
            it(code, () => {
                assert.deepEqual(result, getvariables(code));
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

});