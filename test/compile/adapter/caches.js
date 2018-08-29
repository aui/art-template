const assert = require('assert');
const caches = require('../../../src/compile/adapter/caches');

module.exports = {
    caches: {
        'set value': () => {
            caches.set('test', 'hello');
            assert.deepEqual('hello', caches.get('test'));
        },

        'get value': () => {
            assert.deepEqual('undefined', typeof caches.get('toString'));
        },

        'reset caches': () => {
            caches.set('test', 9);
            caches.reset();
            assert.deepEqual(undefined, caches.get('test'));
        }
    }
};
