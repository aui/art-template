const assert = require('assert');
const esTokenizer = require('../../lib/compile/es-tokenizer');


module.exports = {

    before: () => {
        console.log('#compile/es-tokenizer');
    },

    'parser': {
        'basic': () => {
            const test = (code, result) => {
                assert.deepEqual(result, esTokenizer(code));
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

            test('=>', [{
                type: 'punctuator',
                value: '=>'
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
        }
    }
};