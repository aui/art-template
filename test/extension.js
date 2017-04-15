const assert = require('assert');
const template = require('../');
const defaults = template.defaults;
const path = require('path');
const resetBail = defaults.bail;
const debug = defaults.debug;


module.exports = {
    before: () => {
        console.log('#extension');

        require.extensions['.html'] = template.extension;
        require.extensions['.tpl'] = template.extension;

        defaults.debug = ()=>{
            return ()=> '{Template Error}';
        };
    },

    after: () => {
        defaults.debug = debug;
    },

    'bindExtname': {
        'require .html': () => {
            const render = require(path.join(__dirname, 'res', 'extension.file.html'));
            assert.deepEqual('hello world', render({}));
        },

        'require .tpl': () => {
            const render = require(path.join(__dirname, 'res', 'extension.file.tpl'));
            assert.deepEqual('hello world', render({}));
        },

        'CompileError: bail=false': () => {
            defaults.bail = false;
            const render = require(path.join(__dirname, 'res', 'extension.compile-error.tpl'));
            assert.deepEqual('{Template Error}', render({}));
            defaults.bail = resetBail;
        },

        'CompileError: bail=true': () => {
            defaults.bail = true;
            let runder;

            try {
                runder = require('./res/extension.compile-error.2.tpl');
                
            } catch (e) {
                assert.deepEqual('CompileError', e.name);
            }

            assert.deepEqual('undefined', typeof runder);
            defaults.bail = resetBail;
        },


        'RuntimeError: bail=false': () => {
            defaults.bail = false;
            const render = require(path.join(__dirname, 'res', 'extension.runtime-error.tpl'));
            assert.deepEqual('{Template Error}', render({}));
            defaults.bail = resetBail;
        },


        'RuntimeError: bail=true': () => {
            defaults.bail = true;
            try {
                const render = require(path.join(__dirname, 'res', 'extension.runtime-error.2.tpl'));
                render({});
            } catch (e) {
                assert.deepEqual('RuntimeError', e.name);
            }
            defaults.bail = resetBail;
        }
    }

};