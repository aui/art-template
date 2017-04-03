const assert = require('assert');
const tplLoader = require('../../src/compile/tpl-loader');
const path = require('path');

describe('#compile/tpl-loader', () => {
    it('read file', () => {
        const filename = path.resolve(__dirname, '..', 'res', 'file.html');
        assert.deepEqual('hello world', tplLoader(filename));
    });
});