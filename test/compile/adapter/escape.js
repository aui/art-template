const assert = require('assert');
const escape = require('../../../src/compile/adapter/escape');

describe('#compile/adapter/escape', () => {

    const test = (content, result) => {
        it(JSON.stringify(content) || 'undefined', () => {
            assert.deepEqual(result, escape(content));
        });
    };

    // basic
    test('string', 'string');
    test(1, '1');
    test(0, '0');
    test(function() { return 'value' }, 'value');
    test(() => 'value', 'value');
    test(null, '');
    test(undefined, '');
    test([0, 1, 2, {}], JSON.stringify([0, 1, 2, {}]));
    test({}, JSON.stringify({}));

    // html
    test('<', '&#60;');
    test('>', '&#62;');
    test('"', '&#34;');
    test("'", '&#39;');
    test('&', '&#38;')

    // mixing
    test('<img onerror="alert(0)">', '&#60;img onerror=&#34;alert(0)&#34;&#62;');
    test({
        "<": "&#60;",
        ">": "&#62;",
        '"': "&#34;",
        "'": "&#39;",
        "&": "&#38;"
    }, '{&#34;&#60;&#34;:&#34;&#60;&#34;,&#34;&#62;&#34;:&#34;&#62;&#34;,&#34;\\&#34;&#34;:&#34;&#34;&#34;,&#34;&#39;&#34;:&#34;&#39;&#34;,&#34;&#38;&#34;:&#34;&#38;&#34;}');

});