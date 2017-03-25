const assert = require('assert');
const isOutputExpression = require('../../src/compile/is-output-expression');
const jsTokens = require('../../src/compile/js-tokens');

const test = (code, result) => {
    it(code, () => {
        assert.deepEqual(isOutputExpression(jsTokens(code)), result);
    });
};

describe('#is-output-expression', () => {
    test('value', true);
    test('value + a', true);
    test('value + 2', true);
    test('3 + value + 2.3', true);
    test('value;', true);
    test('value ? a : b', true);
    test('value ? a : b ? c : d + 9.9', true);
    test('if (value) {', false);
    test('if (value) { ', false);
    test('list.each(function() {', false);
    test('list.each(function() { ', false);
});