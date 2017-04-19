const assert = require('assert');
const compile = require('../../src/compile/index');
const tplTokenizer = require('../../src/compile/tpl-tokenizer');
const defaults = require('../../src/compile/defaults');
const onerror = defaults.onerror;
const path = require('path');

let render, data, result;

module.exports = {

    before: () => {
        console.log('#compile/index');
        defaults.onerror = () => {
            return () => '{Template Error}';
        };
    },

    after: () => {
        defaults.onerror = onerror;
    },

    'rule.native': {

        'output': () => {


            render = compile('hello <%=value%>.');
            data = {
                value: 'aui'
            };
            result = render(data);
            assert.deepEqual('hello aui.', result);

            render = compile('hello <%=值%>.');
            data = {
                '值': 'aui'
            };
            result = render(data);
            assert.deepEqual('hello aui.', result);

            render = compile('hello <%=value%>.');
            data = {
                value: '<aui>'
            };
            result = render(data);
            assert.deepEqual('hello &#60;aui&#62;.', result);

            render = compile('hello <%-value%>.');
            data = {
                value: '<aui>'
            };
            result = render(data);
            assert.deepEqual('hello <aui>.', result);

            render = compile(`<%\nprint('hello > world')\n%>`);
            data = {};
            result = render(data);
            assert.deepEqual('hello > world', result);

            // todo empty
        },

        'syntax compat: art-template@v3': () => {


            render = compile('<%== value %>');
            data = {
                value: '<aui>'
            };
            result = render(data);
            assert.deepEqual('<aui>', result);

            render = compile('<%=# value %>');
            data = {
                value: '<aui>'
            };
            result = render(data);
            assert.deepEqual('<aui>', result);
        },

        'syntax compat: ejs': () => {


            render = compile('<%# value %>');
            data = {
                value: 'aui'
            };
            result = render(data);
            assert.deepEqual('', result);

            render = compile('<%= value -%>');
            data = {
                value: 'aui'
            };
            result = render(data);
            assert.deepEqual('aui', result);
        }

    },

    'rule.art': {
        'output': () => {

            render = compile('hello');
            data = {};
            result = render(data);
            assert.deepEqual('hello', result);

            render = compile('hello, {{value}}.');
            data = {
                value: 'world'
            };
            result = render(data);
            assert.deepEqual('hello, world.', result);

            render = compile('{{value}}');
            data = {
                value: '<>'
            };
            result = render(data);
            assert.deepEqual('&#60;&#62;', result);

            render = compile('{{@value}}');
            data = {
                value: '<>'
            };
            result = render(data);
            assert.deepEqual('<>', result);

            render = compile('{{a + b + c}}');
            data = {
                a: 0,
                b: 1,
                c: 2
            };
            result = render(data);
            assert.deepEqual('3', result);

            render = compile('{{a ? b : c}}');
            data = {
                a: 0,
                b: 1,
                c: 2
            };
            result = render(data);
            assert.deepEqual('2', result);

            render = compile('{{a || b || c}}');
            data = {
                a: 0,
                b: 1,
                c: 2
            };
            result = render(data);
            assert.deepEqual('1', result);

        },

        'syntax compat: art-template@v3': () => {

            render = compile('{{#value}}');
            data = {
                value: '<>'
            };
            result = render(data);
            assert.deepEqual('<>', result);
        },

        'filter': () => {
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
            const imports = Object.assign({}, defaults.imports, {
                dateFormat,
                brackets
            });
            const options = {
                imports
            };

            const test = (code, data, result, options = {}) => {
                const render = compile(code, options);
                assert.deepEqual(result, render(data));
            };

            test(`{{print 'hello' '-' 'world'}}`, {}, `hello-world`, options);
            test(`{{value | brackets}}`, {
                value: '糖饼'
            }, '『糖饼』', options);
            test(`{{value.name | brackets}}`, {
                value: {
                    name: '糖饼'
                }
            }, '『糖饼』', options);
            test(`{{time | dateFormat 'yyyy-MM-dd'}}`, {
                time: 1491566794863
            }, `2017-04-07`, options);
            test(`{{time|dateFormat 'yyyy-MM-dd'}}`, {
                time: 1491566794863
            }, `2017-04-07`, options);
            test(`{{time | dateFormat 'yyyy-MM-dd' | brackets}}`, {
                time: 1491566794863
            }, `『2017-04-07』`, options);
            test(`{{time * 1000 | dateFormat 'yyyy-MM-dd'}}`, {
                time: 1491566794
            }, `2017-04-07`, options);
            test(`{{time | dateFormat:'yyyy-MM-dd'}}`, {
                time: 1491566794863
            }, `2017-04-07`, options); // ... v3 compat ...
            test(`{{brackets value}}`, {
                value: '糖饼'
            }, '『糖饼』', options); // ... v3 compat ...
        },


        'include': () => {
            compile('#title: {{title}}', {
                root: '/',
                filename: '/header.html'
            });

            render = compile(`{{include 'header.html'}}\ncontent: {{content}}`);
            data = {
                title: 'hello',
                content: 'world'
            };
            result = render(data);
            assert.deepEqual(`#title: hello\ncontent: world`, result);

            render = compile(`{{include file.header}}\ncontent: {{content}}`);
            data = {
                title: 'hello',
                content: 'world',
                file: {
                    header: 'header.html'
                }
            };
            result = render(data);
            assert.deepEqual(`#title: hello\ncontent: world`, result);

            render = compile(`{{include './header.html'}}\ncontent: {{content}}`);
            data = {
                title: 'hello',
                content: 'world'
            };
            result = render(data);
            assert.deepEqual(`#title: hello\ncontent: world`, result);

            render = compile(`{{include 'header.html' sub}}\ncontent: {{content}}`);
            data = {
                title: 'hello',
                content: 'world',
                sub: {
                    title: '糖饼'
                }
            };
            result = render(data);
            assert.deepEqual(`#title: 糖饼\ncontent: world`, result);

            render = compile({
                filename: path.resolve(__dirname, '..', '..', 'example', 'node-include', 'index.art')
            });
            data = {
                parent: '<style>#example{}</style>'
            };
            result = render(data)
            assert.equal(true, result.indexOf('<title>My Page</title>') > -1);
            assert.equal(true, result.indexOf('<style>#example{}</style>') > -1);
        },


        'layout':()=>{
            render = compile({
                filename: path.resolve(__dirname, '..', '..', 'example', 'node-layout', 'index.art')
            });
            data = {
                parent: '<style>#example{}</style>'
            };
            result = render(data)
            assert.equal(true, result.indexOf('<title>My Page</title>') > -1);
            assert.equal(true, result.indexOf('<style>#example{}</style>') > -1);
        },


        'echo': () => {
            render = compile('{{echo 2017}}');
            data = {};
            result = render(data);
            assert.deepEqual('2017', result);
            render = compile('{{echo value}}');
            data = {
                value: 'hello'
            };
            result = render(data);
            assert.deepEqual('hello', result);
        },


        'each': () => {
            render = compile('{{each}}{{$index}}{{$value}}{{/each}}');
            data = ['a', 'b', 'c'];
            result = render(data);
            assert.deepEqual('0a1b2c', result);
            render = compile('{{each}}{{$index}}{{$value}}{{/each}}');
            data = {
                a: 1,
                b: 2,
                c: 3
            };
            result = render(data);
            assert.deepEqual('a1b2c3', result);

            render = compile('{{each list}}{{$index}}{{$value}}{{/each}}');
            data = {
                list: ['a', 'b', 'c']
            };
            result = render(data);
            assert.deepEqual('0a1b2c', result);

            render = compile('{{each list val}}{{$index}}{{val}}{{/each}}');
            data = {
                list: ['a', 'b', 'c']
            };
            result = render(data);
            assert.deepEqual('0a1b2c', result);

            render = compile('{{each list val key}}{{key}}{{val}}{{/each}}');
            data = {
                list: ['a', 'b', 'c']
            };
            result = render(data);
            assert.deepEqual('0a1b2c', result);

            render = compile('{{each   list   val    key}}{{key}}{{val}}{{/each}}');
            data = {
                list: ['a', 'b', 'c']
            };
            result = render(data);
            assert.deepEqual('0a1b2c', result);

            render = compile('{{each list.data val key}}{{key}}{{val}}{{/each}}');
            data = {
                list: {
                    data: ['a', 'b', 'c']
                }
            };
            result = render(data);
            assert.deepEqual('0a1b2c', result);

            // ... v3 compat ...
            render = compile('{{each list as val}}{{$index}}{{val}}{{/each}}');
            data = {
                list: ['a', 'b', 'c']
            };
            result = render(data);
            assert.deepEqual('0a1b2c', result);
            render = compile('{{each list as val key}}{{key}}{{val}}{{/each}}');
            data = {
                list: ['a', 'b', 'c']
            };
            result = render(data);
            assert.deepEqual('0a1b2c', result);
        },


        'if': () => {
            render = compile('{{if value}}hello world{{/if}}');
            data = {
                value: true
            };
            result = render(data);
            assert.deepEqual('hello world', result);

            render = compile('{{if a.b}}hello world{{/if}}');
            data = {
                a: {
                    b: true
                }
            };
            result = render(data);
            assert.deepEqual('hello world', result);

            render = compile('{{if a.b + 1}}hello world{{/if}}');
            data = {
                a: {
                    b: 1
                }
            };
            result = render(data);
            assert.deepEqual('hello world', result);

            render = compile('{{if value}}hello world{{else}}hello 糖饼{{/if}}');
            data = {
                value: false
            };
            result = render(data);
            assert.deepEqual('hello 糖饼', result);

            render = compile('{{if value !== false}}hello world{{else}}hello 糖饼{{/if}}');
            data = {
                value: false
            };
            result = render(data);
            assert.deepEqual('hello 糖饼', result);

            render = compile('{{if value!==false}}hello world{{else}}hello 糖饼{{/if}}');
            data = {
                value: false
            };
            result = render(data);
            assert.deepEqual('hello 糖饼', result);

            render = compile('{{if a + b === 3}}hello world{{/if}}');
            data = {
                a: 1,
                b: 2
            };
            result = render(data);
            assert.deepEqual('hello world', result);

            render = compile('{{if a}}hello world{{else if b}}😊{{/if}}');
            data = {
                a: 0,
                b: 2
            };
            result = render(data);
            assert.deepEqual('😊', result);

            render = compile('{{if a}}hello world{{else if b}}😊{{/if}}');
            data = {
                a: 0,
                b: 0
            };
            result = render(data);
            assert.deepEqual('', result);
        },


        'set': () => {
            render = compile('{{set value="😊"}}{{value}}');
            data = {};
            result = render(data);
            assert.deepEqual('😊', result);
        }


    },


    'options': {
        'compressor': () => {
            const render = compile('<div>     </div>\n     <%=value%>', {
                compressor: require('../../src/compile/adapter/compressor')
            });
            assert.deepEqual('<div></div>aui', render({
                value: 'aui'
            }));
        },

        'rules': () => {
            const source = 'hello ${name} <%=name%>';
            const options = {
                rules: [{
                    test: /\${([\w\W]*?)}/,
                    use: (match, code) => {
                        return {
                            code,
                            output: tplTokenizer.TYPE_ESCAPE
                        };
                    }
                }]
            };
            const render = compile(source, options);

            assert.deepEqual('hello aui <%=name%>', render({
                name: 'aui'
            }));
        },

        'filename': () => {
            let render, html;

            render = compile({
                filename: path.resolve(__dirname, '..', 'res', 'file')
            });
            html = render({});
            assert.deepEqual('hello world', html);

            render = compile({
                extname: '.html',
                filename: path.resolve(__dirname, '..', 'res', 'file')
            });
            html = render({});
            assert.deepEqual('hello world', html);
        }
    },

    'rule.mix': {},

    'errors': {
        'RuntimeError': {
            'error': () => {
                const render = compile('<%=a.b.c%>');
                assert.deepEqual('{Template Error}', render({}));
            },

            'throw error': () => {
                const render = compile({
                    source: '<%=a.b.c%>',
                    bail: true
                });

                try {
                    render({});
                } catch (e) {
                    assert.deepEqual('RuntimeError', e.name);
                }
            }
        },


        'CompileError': {

            'error': () => {
                let render;
                render = compile('<%=a b c%>');
                assert.deepEqual('{Template Error}', render({}));

                render = compile('{{a b c}}');
                assert.deepEqual('{Template Error}', render({}));
            },

            'throw error': () => {
                let render;
                try {
                    render = compile('<%=a b c%>', {
                        bail: true
                    });
                    render({});
                } catch (e) {
                    assert.deepEqual('CompileError', e.name);
                }
                assert.deepEqual(undefined, render);
            },

            'error line': () => {
                const tpl = `<!--template-->
{{if user}}
  <h2>{{user.name}}</h2>
  <ul>
    {{each user.tags}}
        <li>{{$value}} {{a b c d}}</li>
    {{/each}}
  </ul>
{{/if}}`;
                let render;
                try {
                    render = compile(tpl, {
                        bail: true
                    });
                    render({});
                } catch (e) {
                    assert.deepEqual(6, e.line);
                }
                assert.deepEqual(undefined, render);
            },

            'template not found': () => {
                const render = compile({
                    filename: '/404.html'
                });
                assert.deepEqual('{Template Error}', render({}));
            },

            'throw error: template not found': () => {
                try {
                    compile({
                        filename: '/404.html',
                        bail: true
                    });
                } catch (e) {
                    assert.deepEqual('CompileError', e.name);
                }
            }
        }
    },

    'toString': {
        'compile to string': () => {
            const render = compile('<%=value%>');
            assert.deepEqual('string', typeof render.toString());
            assert.deepEqual(-1, render.toString.toString().indexOf('[native code]'))
        }
    }
};