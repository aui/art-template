const assert = require('assert');
const compile = require('../../src/compile/index');

describe('#compile/index', () => {
    const test = (code, data, result) => {
        it(code, () => {
            const html = compile(code, {
                onerror: null
            })(data);
            assert.deepEqual(result, html);
        });
    };


    test('hello <%=value%>.', { value: 'aui' }, 'hello aui.');
    test('hello <%=value%>.', { value: '<aui>' }, 'hello &#60;aui&#62;.');
    test('hello <%-value%>.', { value: '<aui>' }, 'hello <aui>.');

});