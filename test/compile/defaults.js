const assert = require('assert');
const defaults = require('../../src/compile/defaults');

describe('#compile/defaults', () => {
    it('is object', () => {
        assert.deepEqual('object', typeof defaults);
    });
});