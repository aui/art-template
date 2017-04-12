const assert = require('assert');
const template = require('../src/index');
const defaults = require('../src/compile/defaults');
const path = require('path');

const root = defaults.root;

module.exports = {
    before: () => {
        console.log('#index');
    },

    'template': {
        'render': () => {
            const html = template(__dirname + '/res/template.file.html', {});
            assert.deepEqual('hello world', html);
        },

        'compile': () => {
            defaults.root = path.join(__dirname, 'res');
            const render = template('template.file.html');
            const html = render({});
            assert.deepEqual('hello world', html);
            defaults.root = root;
        },

        'include': ()=>{
            defaults.root = path.join(__dirname, 'res');
            const html = template('index/index.html', {name: 'aui'});
            assert.deepEqual('hello aui\nhello 糖饼', html);
            defaults.root = root;
        },

        'cache': () => {
            template('/index.html', 'hi, <%=value%>.');
            const html = template('/index.html', { value: 'aui' });
            assert.deepEqual('hi, aui.', html);
        }
    }
};