const assert = require('assert');
const onerror = require('../../../src/compile/adapter/onerror');


describe('#compile/adapter/onerror', () => {

    it('return function', () => {
        assert.deepEqual('function', typeof onerror({}));
    });

    it('run function', () => {
        assert.deepEqual('{Template Error}', onerror({})());
    });

});