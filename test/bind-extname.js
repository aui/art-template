const assert = require('assert');
const bindExtname = require('../src/bind-extname');
const defaults = require('../src/compile/defaults');
const path = require('path');





describe('#bind-extname', () => {

    defaults.extname = '.html';
    bindExtname(require);
    bindExtname(require, '.tpl');

    it('require .html', () => {
        const render = require(path.join(__dirname, 'res', 'file.html'));
        assert.deepEqual('hello world', render({}));
    });

    it('require .tpl', () => {
        const render = require(path.join(__dirname, 'res', 'file.tpl'));
        assert.deepEqual('hello world', render({}));
    });

    it('compile error: bail=false', () => {
        defaults.bail = false;
        const render = require(path.join(__dirname, 'res', 'compile-error.tpl'));
        assert.deepEqual('{Template Error}', render({}));
    });

    it('compile error: bail=true', () => {
        defaults.bail = true;
        let runder;

        try {
            runder = require(path.join(__dirname, 'res', 'compile-error.2.tpl'));
        } catch (e) {
            assert.deepEqual('Compile Error', e.name);
        }

        assert.deepEqual('undefined', typeof runder);
    });


    it('runtime error: bail=false', () => {
        defaults.bail = false;
        const render = require(path.join(__dirname, 'res', 'runtime-error.tpl'));
        assert.deepEqual('{Template Error}', render({}));
    });


    it('runtime error: bail=true', () => {
        defaults.bail = true;
        try {
            const render = require(path.join(__dirname, 'res', 'runtime-error.2.tpl'));
            render({});
        } catch (e) {
            assert.deepEqual('Runtime Error', e.name);
        }
    });

});