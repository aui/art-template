const assert = require('assert');
const compile = require('../../src/compile/index');


describe('#compile/index', () => {

    describe('syntax.eval', () => {
        const test = (code, data, result) => {
            it(code, () => {
                const render = compile(code, {
                    bail: true
                });
                const html = render(data);
                assert.deepEqual(result, html);
            });
        };


        describe('output', () => {
            test('hello <%=value%>.', { value: 'aui' }, 'hello aui.');
            test('hello <%=value%>.', { value: '<aui>' }, 'hello &#60;aui&#62;.');
            test('hello <%-value%>.', { value: '<aui>' }, 'hello <aui>.');

            test(`<%\nprint('hello > world')\n%>`, {}, 'hello > world');
            test(`<%- print('hello > world') %>`, {}, 'hello > world');
            test(`<%= print('hello > world') %>`, {}, 'hello &#62; world');
        });

        describe('syntax compat: art-template@v3', () => {
            test('<%== value %>', { value: '<aui>' }, '<aui>');
            test('<%=# value %>', { value: '<aui>' }, '<aui>');
        });

        describe('syntax compat: ejs', () => {
            test('<%# value %>', { value: 'aui' }, '');
            test('<%= value -%>', { value: 'aui' }, 'aui');
        });

        describe('errors', () => {
            it('RuntimeError', () => {
                const render = compile('<%=a.b.c%>');
                assert.deepEqual('{Template Error}', render({}));
            });

            it('CompileError', () => {
                const render = compile('<%=a b c%>');
                assert.deepEqual('{Template Error}', render({}));
            });

            it('CompileError: Template not found', () => {
                const render = compile({
                    filename: '/404.html'
                });
                assert.deepEqual('{Template Error}', render({}));
            });

            it('throw error: RuntimeError', () => {
                const render = compile({
                    source: '<%=a.b.c%>',
                    bail: true
                });

                try {
                    render({});
                } catch (e) {
                    assert.deepEqual('RuntimeError', e.name);
                }
            });

            it('throw error: CompileError: Template not found', () => {
                try {
                    compile({
                        filename: '/404.html',
                        bail: true
                    });
                } catch (e) {
                    assert.deepEqual('CompileError', e.name);
                }
            });

            it('throw error: CompileError', () => {
                try {
                    const render = compile('<%=a b c%>', {
                        bail: true
                    });
                    render({});
                } catch (e) {
                    assert.deepEqual('CompileError', e.name);
                }
            });

        });


        describe('toString', () => {
            const render = compile('<%=value%>');
            it('toString()', () => {
                assert.deepEqual('string', typeof render.toString());
                assert.deepEqual(-1, render.toString.toString().indexOf('[native code]'));
            });
        });
    });




    describe('syntax.basic', () => {
        const test = (code, data, result, options = {}) => {
            it(code, () => {
                const render = compile(code, options);
                assert.deepEqual(result, render(data));
            });
        };

        describe('basic', () => {
            test('hello', {}, 'hello');
            test('hello, {{value}}.', { value: 'world' }, 'hello, world.');
            test('{{value}}', { value: '<>' }, '&#60;&#62;')
            test('{{@value}}', { value: '<>' }, '<>');
            test('{{a + b + c}}', { a: 0, b: 1, c: 2 }, '3');
            test('{{a ? b : c}}', { a: 0, b: 1, c: 2 }, '2');
            test('{{a || b || c}}', { a: 0, b: 1, c: 2 }, '1');

            // ... v3 compat ...
            test('{{#value}}', { value: '<>' }, '<>');
        });

        describe('filter', () => {

            const dateFormat = (date, format) => {
                date = new Date(date);
                const map = {
                    // 月份
                    "M": date.getMonth() + 1,
                    // 日  
                    "d": date.getDate(),
                    // 小时    
                    "h": date.getHours(),
                    // 分      
                    "m": date.getMinutes(),
                    // 秒     
                    "s": date.getSeconds(),
                    // 季度                      
                    "q": Math.floor((date.getMonth() + 3) / 3),
                    // 毫秒 
                    "S": date.getMilliseconds()
                };
                format = format.replace(/([yMdhmsqS])+/g, (all, t) => {
                    let v = map[t];
                    if (v !== undefined) {
                        if (all.length > 1) {
                            v = '0' + v;
                            v = v.substr(v.length - 2);
                        }
                        return v;
                    } else if (t === 'y') {
                        return (date.getFullYear() + '').substr(4 - all.length);
                    }
                    return all;
                });
                return format;
            };

            const brackets = string => `『${string}』`;
            const options = { imports: { dateFormat, brackets } };

            test(`{{print "hello" ', ' "world"}}`, {}, `hello, world`, options);
            test(`{{value | brackets}}`, { value: '糖饼' }, '『糖饼』', options);
            test(`{{time | dateFormat 'yyyy-MM-dd'}}`, { time: 1491566794863 }, `2017-04-07`, options);
            test(`{{time|dateFormat 'yyyy-MM-dd'}}`, { time: 1491566794863 }, `2017-04-07`, options);
            test(`{{time | dateFormat 'yyyy-MM-dd' | brackets}}`, { time: 1491566794863 }, `『2017-04-07』`, options);
            test(`{{time * 1000 | dateFormat 'yyyy-MM-dd'}}`, { time: 1491566794 }, `2017-04-07`, options);
            test(`{{time | dateFormat:'yyyy-MM-dd'}}`, { time: 1491566794863 }, `2017-04-07`, options); // ... v3 compat ...
            test(`{{brackets value}}`, { value: '糖饼' }, '『糖饼』', options); // ... v3 compat ...
        });

        // describe('include', () => {
        //     compile('#title: {{title}}', {
        //         root: '/',
        //         filename: '/header.html'
        //     });

        //     test(`{{include 'header.html'}}\ncontent: {{content}}`, { title: 'hello', content: 'world' }, `#title: hello\ncontent: world`);
        //     test(`{{include './header.html'}}\ncontent: {{content}}`, { title: 'hello', content: 'world' }, `#title: hello\ncontent: world`);
        //     test(`{{include 'header.html' sub}}\ncontent: {{content}}`, { title: 'hello', content: 'world', sub: { title: '糖饼' } }, `#title: 糖饼\ncontent: world`);
        // });


        describe('echo', () => {
            test('{{echo 2017}}', {}, '2017');
            test('{{echo value}}', { value: 'hello' }, 'hello');
        });


        describe('each', () => {
            test('{{each}}{{$index}}{{$value}}{{/each}}', ['a', 'b', 'c'], '0a1b2c');
            test('{{each}}{{$index}}{{$value}}{{/each}}', { a: 1, b: 2, c: 3 }, 'a1b2c3');

            test('{{each list}}{{$index}}{{$value}}{{/each}}', { list: ['a', 'b', 'c'] }, '0a1b2c');
            test('{{each list val}}{{$index}}{{val}}{{/each}}', { list: ['a', 'b', 'c'] }, '0a1b2c');
            test('{{each list val key}}{{key}}{{val}}{{/each}}', { list: ['a', 'b', 'c'] }, '0a1b2c');

            // ... v3 compat ...
            test('{{each list as val}}{{$index}}{{val}}{{/each}}', { list: ['a', 'b', 'c'] }, '0a1b2c');
            test('{{each list as val key}}{{key}}{{val}}{{/each}}', { list: ['a', 'b', 'c'] }, '0a1b2c');
        });


        describe('if', () => {
            test('{{if value}}hello world{{/if}}', { value: true }, 'hello world');
            test('{{if value}}hello world{{else}}hello 糖饼{{/if}}', { value: false }, 'hello 糖饼');
            test('{{if value !== false}}hello world{{else}}hello 糖饼{{/if}}', { value: false }, 'hello 糖饼');
            test('{{if value!==false}}hello world{{else}}hello 糖饼{{/if}}', { value: false }, 'hello 糖饼');
            test('{{if a + b === 3}}hello world{{/if}}', { a: 1, b: 2 }, 'hello world');
            test('{{if a}}hello world{{else if b}}😊{{/if}}', { a: 0, b: 2 }, '😊');
        });


        describe('set', () => {
            test('{{set value="😊"}}{{value}}', {}, '😊');
        });
    });




    describe('syntax.mix', () => {
        const test = (code, data, result, options = {}) => {
            it(code, () => {
                const render = compile(code, options);
                assert.deepEqual(result, render(data));
            });
        };

        test('<%=a%>, {{b}}', { a: 1, b: 2 }, '1, 2');

    });



    describe('options', () => {

        it('compress', () => {
            const render = compile('<div>     </div>\n     <%=value%>', {
                compress: require('../../src/compile/adapter/compress')
            });
            assert.deepEqual('<div> </div> aui', render({
                value: 'aui'
            }));
        });

    });

});