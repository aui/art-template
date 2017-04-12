const assert = require('assert');
const cache = require('../../../src/compile/adapter/cache');


module.exports = {
    before: () => {
        console.log('#compile/adapter/cache');
    },

    'cache': {
        'set value': () => {
            cache.set('test', 'hello');
            assert.deepEqual('hello', cache.get('test'));
        },

        'get value': () => {
            assert.deepEqual('undefined', typeof cache.get('toString'));
        },

        'reset cache': () => {
            cache.set('test', 9);
            cache.reset();
            assert.deepEqual(undefined, cache.get('test'));
        },
    }
};