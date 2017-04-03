const assert = require('assert');
const cache = require('../../../src/compile/adapter/cache');

describe('#compile/adapter/cache', () => {

    it('set value', () => {
        cache.set('test', 'hello');
        assert.deepEqual('hello', cache.get('test'));
    });

    it('get value', () => {
        assert.deepEqual('undefined', typeof cache.get('toString'));
    });

    it('reset cache', () => {
        cache.set('test', 9);
        cache.reset();
        assert.deepEqual(undefined, cache.get('test'));
    });
});