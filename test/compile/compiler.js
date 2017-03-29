const assert = require('assert');
const Compiler = require('../../src/compile/compiler');
const defaults = require('../../src/compile/defaults');

describe('#compile/compiler', () => {

    describe('addContext', () => {
        const test = (code, result) => {
            it(code, () => {
                const compiler = new Compiler('', defaults);
                compiler.addContext(code);
                result.$out = '""';
                assert.deepEqual(result, compiler.context);
            });
        };

        test('value', {
            value: '$data.value'
        });

        test('if', {});
        test('for', {});
        test('$data', {});
        test('$imports', {});
        test('$utils', {});

        test('$string', { $string: '$utils.$string' });
        test('$escape', { $escape: '$utils.$escape' });
        test('$include', { $include: '$utils.$include' });

        it('imports', () => {
            const options = Object.create(defaults);
            options.imports.Math = Math;
            const compiler = new Compiler('', options);
            compiler.addContext('Math');
            assert.deepEqual({
                $out: '""',
                Math: '$imports.Math'
            }, compiler.context);
        });

    });


    describe('addString', () => {
        const test = (code, result, options) => {
            it(code, () => {
                options = Object.assign({}, defaults, options);
                const compiler = new Compiler('', options);
                compiler.addString(code);
                assert.deepEqual(result, compiler.scripts);
            });
        };

        // raw
        test('hello', ['$out+="hello"']);
        test('\'hello\'', ['$out+="\'hello\'"']);
        test('"hello    world"', ['$out+="\\"hello    world\\""']);
        test('<div>hello</div>', ['$out+="<div>hello</div>"']);
        test('<div id="test">hello</div>', ['$out+="<div id=\\"test\\">hello</div>"']);

        // compress
        test('  hello  ', ['$out+=" hello "'], { compress: true });
        test('\n  hello  \n\n.', ['$out+=" hello ."'], { compress: true });
        test('"hello    world"', ['$out+="\\"hello world\\""'], { compress: true });
        test('\'hello    world\'', ['$out+="\'hello world\'"'], { compress: true });
    });


    describe('addExpression', () => {
        const test = (code, result, options) => {
            it(code, () => {
                options = Object.assign({}, defaults, options);
                const compiler = new Compiler('', options);
                compiler.addExpression(code);
                assert.deepEqual(result, compiler.scripts);
            });
        };

        // v3 compat
        test('<%=value%>', ['$out+=$escape(value)']);
        test('<%=#value%>', ['$out+=$string(value)']);

        // v4
        test('<%value%>', ['$out+=$escape(value)']);
        test('<% value %>', ['$out+=$escape( value )']);
        test('<%-value%>', ['$out+=$string(value)']);
        test('<%- value %>', ['$out+=$string( value )']);

        test('<%value%>', ['$out+=$string(value)'], { escape: false });
        test('<%-value%>', ['$out+=$string(value)'], { escape: false });

        test('<%if (value) {%>', ['if (value) {']);
        test('<% if (value) { %>', [' if (value) { ']);
        test('<%    if ( value ) {    %>', ['    if ( value ) {    '], {
            compress: true
        });

    });

    describe('addSource', () => {
        const test = (code, result, options) => {
            it(code, () => {
                options = Object.assign({}, defaults, options);
                const compiler = new Compiler(code, options);
                assert.deepEqual(result, compiler.scripts);
            });
        };

        test('hello', ['$out+="hello"']);
        test('<%value%>', ['$out+=$escape(value)']);

        test('hello<%value%>', ['$out+="hello"', '$out+=$escape(value)']);
        test('hello\n<%value%>', ['$out+="hello\\n"', '$out+=$escape(value)']);

        test('<% if (value) { %>\nhello\n<% } %>', [' if (value) { ', '$out+="\\nhello\\n"', ' } ']);

    });


    describe('build', () => {
        const test = (code, result, options) => {
            it(code, () => {
                options = Object.assign({}, defaults, options);
                const compiler = new Compiler(code, options);
                console.log(compiler.build().toString());
                assert.deepEqual(result, compiler.scripts);
            });
        };

        test('hello', ['$out+="hello"']);
        test('<%value%>', ['$out+=$escape(value)']);

        test('hello<%value%>', ['$out+="hello"', '$out+=$escape(value)']);
        test('hello\n<%value%>', ['$out+="hello\\n"', '$out+=$escape(value)']);

        test('<% if (value) { %>\nhello\n<% } %>', [' if (value) { ', '$out+="\\nhello\\n"', ' } ']);

    });




});