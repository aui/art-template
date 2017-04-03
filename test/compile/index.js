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


    describe('errors', () => {
        it('Runtime Error', () => {
            const render = compile('<%=a.b.c%>');
            assert.deepEqual('{Template Error}', render({}));
        });

        it('Compile Error', () => {
            const render = compile('<%=a b c%>');
            assert.deepEqual('{Template Error}', render({}));
        });

        it('Compile Error: Template not found', () => {
            const render = compile({
                filename: '/404.html'
            });
            assert.deepEqual('{Template Error}', render({}));
        });

        it('throw error: Runtime Error', () => {
            const render = compile({
                source: '<%=a.b.c%>',
                onerror: null
            });

            try {
                render({});
            } catch (e) {
                assert.deepEqual('Runtime Error', e.name);
            }
        });

        it('throw error: Compile Error: Template not found', () => {
            try {
                compile({
                    filename: '/404.html',
                    onerror: null
                });
            } catch (e) {
                assert.deepEqual('Compile Error', e.name);
            }
        });

        it('throw error: Compile Error', () => {
            try {
                const render = compile('<%=a b c%>', {
                    onerror: null
                });
                render({});
            } catch (e) {
                assert.deepEqual('Compile Error', e.name);
            }
        });

    });


});