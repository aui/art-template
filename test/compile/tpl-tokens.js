const assert = require('assert');
const tplTokens = require('../../src/compile/tpl-tokens');
const jsTokens = require('../../src/compile/js-tokens');
const defaults = require('../../src/compile/defaults');
const rules = defaults.rules;

describe('#compile/tpl-tokens', () => {

    const test = (code, result) => {
        it(code, () => {
            assert.deepEqual(result, tplTokens.parser(code, rules, {
                getTokens: jsTokens.parser,
                getVariables: jsTokens.getVariables,
                options: {
                    imports: {}
                }
            }));
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
        script: {
            code: 'name',
            output: tplTokens.TYPE_ESCAPE,
            variables: ['name']
        }
    }]);


    test('hello {{name}}.', [{
        type: tplTokens.TYPE_STRING,
        value: 'hello ',
        line: 1
    }, {
        type: tplTokens.TYPE_EXPRESSION,
        value: '{{name}}',
        line: 1,
        script: {
            code: 'name',
            output: tplTokens.TYPE_ESCAPE,
            variables: ['name']
        }
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
        script: {
            code: 'name+aaa',
            output: tplTokens.TYPE_ESCAPE,
            variables: ['name', 'aaa']
        }
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
        script: {
            code: 'name+aaa',
            output: tplTokens.TYPE_ESCAPE,
            variables: ['name', 'aaa']
        }
    }, {
        type: tplTokens.TYPE_STRING,
        value: '.',
        line: 3
    }]);

    test('hello\n\n<% a b c d %>', [{
        type: tplTokens.TYPE_STRING,
        value: 'hello\n\n',
        line: 1
    }, {
        type: tplTokens.TYPE_EXPRESSION,
        value: '<% a b c d %>',
        line: 3,
        script: {
            code: ' a b c d ',
            output: false
        }
    }]);

});