const assert = require('assert');
const tplTokens = require('../../src/compile/tpl-tokens');

const test = (code, result, openTag = '{{', closeTag = '}}') => {
    it(code, () => {
        assert.deepEqual(result, tplTokens.parser(code, openTag, closeTag));
    });
};

describe('#tpl-tokens', () => {
    test('hello', [{
        type: 'string',
        value: 'hello'
    }]);

    test('{{name}}', [{
        type: 'expression',
        value: '{{name}}'
    }]);


    test('hello {{name}}.', [{
        type: 'string',
        value: 'hello '
    }, {
        type: 'expression',
        value: '{{name}}'
    }, {
        type: 'string',
        value: '.'
    }]);

    test('hello {{name + aaa}}.\n', [{
        type: 'string',
        value: 'hello '
    }, {
        type: 'expression',
        value: '{{name + aaa}}'
    }, {
        type: 'string',
        value: '.\n'
    }]);

});