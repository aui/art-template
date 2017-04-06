const assert = require('assert');
const bindExtname = require('../src/bind-extname');
const path = require('path');



describe('#bind-extname', () => {
    it('require .html', () => {
        bindExtname(require);
        const render = require(path.join(__dirname, 'res', 'file.html'));
        assert.deepEqual('hello world', render({}));
    });

    it('require .tpl', () => {
        bindExtname(require, '.tpl');
        const render = require(path.join(__dirname, 'res', 'file.tpl'));
        assert.deepEqual('hello world', render({}));
    });
});