const assert = require('assert');
const getOptions = require('../../src/compile/get-options');

describe('#compile/get-options', () => {

    it('mix', () => {
        const options = { a: 1, f: [{}] }
        const defaults = { a: 2, c: 3, d: null };
        assert.deepEqual({
            a: 1,
            c: 3,
            d: null,
            f: [{}]
        }, getOptions(options, defaults));
        assert.deepEqual(2, defaults.a);
    });

    it('mix function', () => {
        const fn = () => {};
        const options = {}
        const defaults = { a: fn };

        assert.deepEqual({
            a: fn
        }, getOptions(options, defaults));
    });

    it('mix prototype', () => {
        const fn = () => {};
        const clone = Object.create({
            b: 1,
            c: fn
        });
        const options = {}
        const defaults = { a: clone };

        assert.deepEqual({
            b: 1,
            c: fn
        }, getOptions(options, defaults).a);
    });

});