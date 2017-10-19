const assert = require('assert');
const template = require('../lib/index');
const defaults = require('../lib/compile/defaults');
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
            assert.deepEqual(true, html.indexOf('aui') !== -1);
            assert.deepEqual(true, html.indexOf('糖饼') !== -1);
            defaults.root = root;
        },

        'cache': () => {
            template('/index.html', 'hi, <%=value%>.');
            const html = template('/index.html', { value: 'aui' });
            assert.deepEqual('hi, aui.', html);
        },

        'nestedBlockUseActualValue': () => {
            defaults.root = path.join(__dirname, 'res');
            const html = template('nested-block/index.art', {hello : 'hello'});
            assert.deepEqual('hello', html);
            defaults.root = root;
        },

        'nestedBlockUseDefaultValue': () => {
            defaults.root = path.join(__dirname, 'res');
            const html = template('nested-block/default.art', {});
            assert.deepEqual('default', html);
            defaults.root = root;
        }
    }
};