const assert = require('assert');
const compile = require('../src/compile');
const bindSyntax = require('../src/bind-syntax');
const options = bindSyntax({});

options.imports.dateFormat = (date, format) => {
    date = new Date(date);
    var map = {
        "M": date.getMonth() + 1, //月份 
        "d": date.getDate(), //日 
        "h": date.getHours(), //小时 
        "m": date.getMinutes(), //分 
        "s": date.getSeconds(), //秒 
        "q": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    format = format.replace(/([yMdhmsqS])+/g, (all, t) => {
        var v = map[t];
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

describe('#bind-syntax', () => {
    const test = (code, data, result) => {
        it(code, () => {
            const render = compile(code, options);
            assert.deepEqual(result, render(data));
        });
    };

    test('hello', {}, 'hello');
    test('hello, {{value}}.', { value: 'world' }, 'hello, world.');

    test(`{{print "hello" "world"}}`, {}, `helloworld`);
    test(`{{time | dateFormat 'yyyy-MM-dd hh:mm:ss'}}`, { time: 1491566794863 }, `2017-04-07 20:06:34`);
});