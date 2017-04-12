const assert = require('assert');
const debug = require('../../../src/compile/adapter/debug');

module.exports = {
    before: () => {
        console.log('#compile/adapter/debug');
    },
    'debug': {
        'return function': () => {
            assert.deepEqual('function', typeof debug({}));
        },

        'run function': () => {
            assert.deepEqual('{Template Error}', debug({})());
        }
    }
};