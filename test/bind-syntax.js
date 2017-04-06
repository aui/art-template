const assert = require('assert');
const compile = require('../src/compile');
const bindSyntax = require('../src/bind-syntax');
const defaults = require('../src/compile/defaults');
const options = bindSyntax({ imports: defaults.imports });

describe('#bind-syntax', () => {
    const test = (code, data, result) => {
        it(code, () => {
            const render = compile(code, options);
            assert.deepEqual(result, render(data));
        });
    };

    test('hello', {}, 'hello');
    test('hello, {{value}}.', { value: 'world' }, 'hello, world.');
});