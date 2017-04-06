const assert = require('assert');
const debug = require('../../../src/compile/adapter/debug');


describe('#compile/adapter/debug', () => {

    it('return function', () => {
        assert.deepEqual('function', typeof debug({}));
    });

    it('run function', () => {
        assert.deepEqual('{Template Error}', debug({})());
    });

});