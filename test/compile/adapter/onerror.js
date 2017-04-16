const assert = require('assert');
const debuger = require('../../../src/compile/adapter/debuger');

module.exports = {
    before: () => {
        console.log('#compile/adapter/debuger');
    },
    'debuger': {
        'return function': () => {
            assert.deepEqual('function', typeof debuger({}));
        },

        'run function': () => {
            assert.deepEqual('{Template Error}', debuger({})());
        }
    }
};