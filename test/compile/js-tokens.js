const assert = require('assert');
const jsTokens = require('../../src/compile/js-tokens');


describe('#compile/js-tokens', () => {



    describe('parser', () => {

        const test = (code, result) => {
            it(code, () => {
                assert.deepEqual(result, jsTokens.parser(code));
            });
        };

        test('var', [{
            type: 'keyword',
            value: 'var'
        }]);

        test('0.99', [{
            type: 'number',
            value: '0.99'
        }]);

        test('"value"', [{
            type: 'string',
            value: '"value"',
            closed: true
        }]);

        test('/*value*/', [{
            type: 'comment',
            value: '/*value*/',
            closed: true
        }]);

        test('#', [{
            type: 'invalid',
            value: '#'
        }]);

        test('@', [{
            type: 'invalid',
            value: '@'
        }]);

        test('a.b.c+d', [{
            type: 'name',
            value: 'a'
        }, {
            type: 'punctuator',
            value: '.'
        }, {
            type: 'name',
            value: 'b'
        }, {
            type: 'punctuator',
            value: '.'
        }, {
            type: 'name',
            value: 'c'
        }, {
            type: 'punctuator',
            value: '+'
        }, {
            type: 'name',
            value: 'd'
        }]);

        test('@if a + b === 0', [{
            type: 'invalid',
            value: '@'
        }, {
            type: 'keyword',
            value: 'if'
        }, {
            type: 'whitespace',
            value: ' '
        }, {
            type: 'name',
            value: 'a'
        }, {
            type: 'whitespace',
            value: ' '
        }, {
            type: 'punctuator',
            value: '+'
        }, {
            type: 'whitespace',
            value: ' '
        }, {
            type: 'name',
            value: 'b'
        }, {
            type: 'whitespace',
            value: ' '
        }, {
            type: 'punctuator',
            value: '==='
        }, {
            type: 'whitespace',
            value: ' '
        }, {
            type: 'number',
            value: '0'
        }]);
    });



    describe('variables', () => {

        const getvariables = code => jsTokens.variables(jsTokens.parser(code));
        const test = (code, result) => {
            it(code, () => {
                assert.deepEqual(result, getvariables(code));
            });
        };

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


    describe('trimLeft', () => {

        const test = (code, result) => {
            it(code, () => {
                const tokens = jsTokens.parser(code);
                const length = tokens.length;
                assert.deepEqual(result, jsTokens.trimLeft(tokens));
                assert.deepEqual(length, tokens.length);
            });
        };

        test(' value', [{
            type: 'name',
            value: 'value'
        }]);

        test('     value', [{
            type: 'name',
            value: 'value'
        }]);

        test('     value ', [{
            type: 'name',
            value: 'value'
        }, {
            type: 'whitespace',
            value: ' '
        }]);
    });


    describe('trimRight', () => {
        const test = (code, result) => {
            it(code, () => {
                const tokens = jsTokens.parser(code);
                const length = tokens.length;
                assert.deepEqual(result, jsTokens.trimRight(tokens));
                assert.deepEqual(length, tokens.length);
            });
        };

        test('value ', [{
            type: 'name',
            value: 'value'
        }]);

        test('value     ', [{
            type: 'name',
            value: 'value'
        }]);

        test(' value     ', [{
            type: 'whitespace',
            value: ' '
        }, {
            type: 'name',
            value: 'value'
        }]);
    });


    describe('trim', () => {
        const test = (code, result) => {
            it(code, () => {
                const tokens = jsTokens.parser(code);
                const length = tokens.length;
                assert.deepEqual(result, jsTokens.trim(tokens));
                assert.deepEqual(length, tokens.length);
            });
        };

        test(' value ', [{
            type: 'name',
            value: 'value'
        }]);

        test('    value     ', [{
            type: 'name',
            value: 'value'
        }]);
    });



    /*describe('autocomplete', () => {
        const test = (code, result) => {
            it(code, () => {
                const tokens = jsTokens.parser(code);
                const newTokens = jsTokens.autocomplete(tokens);
                const newCode = jsTokens.toString(newTokens);
                assert.deepEqual(result, newCode);
            });
        };

        // (){ => }
        // (()()){ => }
        [/(^.*?(?:if|for)\s*\(.*?\)\s*{\s*$)/, '$1}'];

        test('if(value){', 'if(value){}');
        test('for(var i in data){', 'for(var i in data){}');

        // ((){ => })
        [/(^.*?\(\s*function\s*\(.*?\)\s*{$)|(^.*?\(\s*.*=>\s*{$)/, '$1})'];

        test('each(function(a,b){', 'each(function(a,b){})');
        test('each((a,b)=>{', 'each(()=>{})');
        test('each(a=>{', 'each(a=>{})');

        [/^\s*}.*?{?\s*$/, ''];
        // }{ =>
        test('}else{', '');
        // } =>
        test('}', '');
    });*/

});