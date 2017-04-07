const assert = require('assert');
const compile = require('../src/compile');
const bindSyntax = require('../src/bind-syntax');
const options = bindSyntax({});


describe('#bind-syntax', () => {
    const test = (code, data, result) => {
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

        options.imports.dateFormat = (date, format) => {
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

        options.imports.brackets = string => `『${string}』`;

        test(`{{print "hello" ', ' "world"}}`, {}, `hello, world`);
        test(`{{value | brackets}}`, { value: '糖饼' }, '『糖饼』');
        test(`{{time | dateFormat 'yyyy-MM-dd hh:mm:ss'}}`, { time: 1491566794863 }, `2017-04-07 20:06:34`);
        test(`{{time|dateFormat 'yyyy-MM-dd hh:mm:ss'}}`, { time: 1491566794863 }, `2017-04-07 20:06:34`);
        test(`{{time | dateFormat 'yyyy-MM-dd hh:mm:ss' | brackets}}`, { time: 1491566794863 }, `『2017-04-07 20:06:34』`);
        test(`{{time * 1000 | dateFormat 'yyyy-MM-dd hh:mm:ss'}}`, { time: 1491566794 }, `2017-04-07 20:06:34`);
        test(`{{time | dateFormat:'yyyy-MM-dd hh:mm:ss'}}`, { time: 1491566794863 }, `2017-04-07 20:06:34`); // ... v3 compat ...
        test(`{{brackets value}}`, { value: '糖饼' }, '『糖饼』'); // ... v3 compat ...
    });

    describe('include', () => {
        const filename = options.filename;
        const source = options.source;

        options.filename = '/header.html';
        options.source = '#title: {{title}}';
        compile(options);

        test(`{{include 'header.html'}}\ncontent: {{content}}`, { title: 'hello', content: 'world' }, `#title: hello\ncontent: world`);
        test(`{{include './header.html'}}\ncontent: {{content}}`, { title: 'hello', content: 'world' }, `#title: hello\ncontent: world`);
        test(`{{include 'header.html' sub}}\ncontent: {{content}}`, { title: 'hello', content: 'world', sub: { title: '糖饼' } }, `#title: 糖饼\ncontent: world`);

        options.filename = filename;
        options.source = source;
    });


    describe('echo', () => {
        test('{{echo 2017}}', {}, '2017');
        test('{{echo value}}', { value: 'hello' }, 'hello');
        //test('{{echo a+b}}', { a: 1, b: 2 }, '3');
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


    describe('%', () => {
        test('{{% for(var i = 0; i < 3; i++){print(i + ".")} %}}', {}, '0.1.2.');
    });

});