const assert = require('assert');
const tplTokens = require('../../src/compile/tpl-tokens');

describe('#compile/tpl-tokens', () => {

    const test = (code, result, openTag = '{{', closeTag = '}}') => {
        it(code, () => {
            assert.deepEqual(result, tplTokens.parser(code, openTag, closeTag));
        });
    };

    test('hello', [{
        type: 'string',
        value: 'hello',
        line: 1
    }]);

    test('{{name}}', [{
        type: 'expression',
        value: '{{name}}',
        line: 1
    }]);


    test('hello {{name}}.', [{
        type: 'string',
        value: 'hello ',
        line: 1
    }, {
        type: 'expression',
        value: '{{name}}',
        line: 1
    }, {
        type: 'string',
        value: '.',
        line: 1
    }]);

    test('hello {{name + aaa}}.\n', [{
        type: 'string',
        value: 'hello ',
        line: 1
    }, {
        type: 'expression',
        value: '{{name + aaa}}',
        line: 1
    }, {
        type: 'string',
        value: '.\n',
        line: 1
    }]);

    test('hello \n{{\n name + aaa}}.', [{
        type: 'string',
        value: 'hello \n',
        line: 1
    }, {
        type: 'expression',
        value: '{{\n name + aaa}}',
        line: 2
    }, {
        type: 'string',
        value: '.',
        line: 3
    }]);

});