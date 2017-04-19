const assert = require('assert');
const onerror = require('../../../src/compile/adapter/onerror');

module.exports = {
    before: () => {
        console.log('#compile/adapter/onerror');
    },
    'onerror': {
        'return function': () => {
            assert.deepEqual('function', typeof onerror({}));
        },

        'run function': () => {
            assert.deepEqual('{Template Error}', onerror({})());
        }
    }
};