const assert = require('assert');
const template = require('../src/index');
const defaults = require('../src/compile/defaults');
const path = require('path');

const root = defaults.root;



describe('#index', () => {

    describe('template', () => {
        it('render', () => {
            const html = template(__dirname + '/res/template.file.html', {});
            assert.deepEqual('hello world', html);
        });

        it('compile', () => {
            defaults.root = path.join(__dirname, 'res');
            const render = template('template.file.html');
            const html = render({});
            assert.deepEqual('hello world', html);
        });
    });


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


defaults.root = root;