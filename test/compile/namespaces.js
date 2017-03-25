const assert = require('assert');
const namespaces = require('../../src/compile/namespaces');
const jsTokens = require('../../src/compile/js-tokens');

const getNamespaces = code => namespaces(jsTokens(code));
const test = (code, result) => {
    it(code, () => {
        assert.deepEqual(getNamespaces(code), result);
    });
};

describe('#namespaces', () => {

    test('var', []);
    test('var a', ['a']);
    test('a', ['a']);
    test('a.b', ['a']);
    test('a.b;c', ['a', 'c']);
    test('a.b\nd', ['a', 'd']);
    test('0.99 + a', ['a']);
    test('0.99 + a + b.c', ['a', 'b']);
    test('a /*.*/. b /**/; c', ['a', 'c']);
    test('a ".b.c; d;" /*e*/ f', ['a', 'f']);

});