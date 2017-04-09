const assert = require('assert');
const tplTokens = require('../../src/compile/tpl-tokens');
const defaults = require('../../src/compile/defaults');
const syntax = defaults.syntax;

describe('#compile/tpl-tokens', () => {

    const test = (code, result) => {
        it(code, () => {
            assert.deepEqual(result, tplTokens.parser(code, syntax));
        });
    };

    test('hello', [{
        type: tplTokens.TYPE_STRING,
        value: 'hello',
        line: 1
    }]);

    test('{{name}}', [{
        type: tplTokens.TYPE_EXPRESSION,
        value: '{{name}}',
        line: 1,
        syntax: 'ART',
        output: false,
        code: 'name',
        tokens: [{
            type: 'name',
            value: 'name'
        }],
        variables: ['name'],
        parser: syntax[1].parser
    }]);


    test('hello {{name}}.', [{
        type: tplTokens.TYPE_STRING,
        value: 'hello ',
        line: 1
    }, {
        type: tplTokens.TYPE_EXPRESSION,
        value: '{{name}}',
        line: 1,
        syntax: 'ART',
        output: false,
        code: 'name',
        tokens: [{
            type: 'name',
            value: 'name'
        }],
        variables: ['name'],
        parser: syntax[1].parser
    }, {
        type: tplTokens.TYPE_STRING,
        value: '.',
        line: 1
    }]);

    test('hello {{name + aaa}}.\n', [{
        type: tplTokens.TYPE_STRING,
        value: 'hello ',
        line: 1
    }, {
        type: tplTokens.TYPE_EXPRESSION,
        value: '{{name + aaa}}',
        line: 1,
        syntax: 'ART',
        output: false,
        code: 'name + aaa',
        tokens: [{
            type: 'name',
            value: 'name'
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
            value: 'aaa'
        }],
        variables: ['name', 'aaa'],
        parser: syntax[1].parser
    }, {
        type: tplTokens.TYPE_STRING,
        value: '.\n',
        line: 1
    }]);

    test('hello \n{{\n name + aaa}}.', [{
        type: tplTokens.TYPE_STRING,
        value: 'hello \n',
        line: 1
    }, {
        type: tplTokens.TYPE_EXPRESSION,
        value: '{{\n name + aaa}}',
        line: 2,
        syntax: 'ART',
        output: false,
        code: '\n name + aaa',
        tokens: [{
            type: 'whitespace',
            value: '\n '
        }, {
            type: 'name',
            value: 'name'
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
            value: 'aaa'
        }],
        variables: ['name', 'aaa'],
        parser: syntax[1].parser
    }, {
        type: tplTokens.TYPE_STRING,
        value: '.',
        line: 3
    }]);

});