const assert = require('assert');
const jsTokens = require('../../src/compile/js-tokens');

const test = (code, result) => {
    it(code, () => {
        assert.deepEqual(jsTokens(code), result);
    });
};

describe('js-tokens', () => {
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