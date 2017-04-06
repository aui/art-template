const assert = require('assert');
const template = require('../src/index');




describe('#index', () => {
    describe('render', () => {
        const test = (code, data, result) => {
            it(code, () => {
                assert.deepEqual(result, template.render(code, data));
            });
        };
        test('hello, <%=value%>.', {
            value: 'aui'
        }, 'hello, aui.');
    });

    describe('compile', () => {
        const test = (code, data, result) => {
            it(code, () => {
                assert.deepEqual(result, template.compile(code)(data));
            });
        };
        test('hello, <%=value%>.', {
            value: 'aui'
        }, 'hello, aui.');
    });

});