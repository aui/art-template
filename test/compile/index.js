const assert = require('assert');
const compile = require('../../src/compile/index');

describe('#compile/index', () => {
    const test = (code, data, result) => {
        it(code, () => {
            const render = compile(code, {
                onerror: null
            });
            const html = render(data);
            assert.deepEqual(result, html);
        });
    };


    test('hello <%=value%>.', { value: 'aui' }, 'hello aui.');
    test('hello <%=value%>.', { value: '<aui>' }, 'hello &#60;aui&#62;.');
    test('hello <%-value%>.', { value: '<aui>' }, 'hello <aui>.');

});