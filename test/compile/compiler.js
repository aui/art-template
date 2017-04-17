const assert = require('assert');
const Compiler = require('../../src/compile/compiler');
const defaults = require('../../src/compile/defaults');
const ruleNative = require('../../src/compile/adapter/rule.native');

const compressor = ({ source }) => {
    return source
        .replace(/\s+/g, ` `)
        .replace(/<!--[\w\W]*?-->/g, ``);
};


module.exports = {
    before: () => {
        console.log('#compile/index');
    },

    'getVariables': {
        'basic': ()=>{
            const test = (code, result) => {
                const tokens = Compiler.prototype.getEsTokens(code);
                const variables = Compiler.prototype.getVariables(tokens);
                assert.deepEqual(result, variables);
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

            test('a[b]', ['a', 'b']);
            test('a[b].c[d]', ['a', 'b', 'd']);
            test('a["b"]', ['a']);
        }
    },

    'importContext': {

        'basic': () => {
            const test = (code, result, options) => {
                options = defaults.$extend(options);
                options.source = '';
                const compiler = new Compiler(options);
                compiler.importContext(code);
                result.$out = '""';
                assert.deepEqual(result, compiler.context);
            };

            test('value', {
                value: '$data.value'
            });

            test('if', {});
            test('for', {});
            test('$data', {});
            test('$imports', {});

            test('print', { print: "function(){$out+=''.concat.apply('',arguments)}" });
            test('include', { include: "function(src,data){$out+=$imports.$include(src,data||$data,$options)}" })

            test('$escape', { $escape: '$imports.$escape' });
            test('$include', { $include: '$imports.$include' });

        },

        'imports': () => {
            const options = defaults.$extend({});
            options.imports.Math = Math;
            options.source = '';
            const compiler = new Compiler(options);
            compiler.importContext('Math');
            assert.deepEqual({
                $out: '""',
                Math: '$imports.Math'
            }, compiler.context);
        }
    },

    'addSource': {
        basic: () => {
            const test = (code, result, options) => {
                options = defaults.$extend(options);
                options.source = code;
                const compiler = new Compiler(options);
                assert.deepEqual(result, compiler.scripts.map(script => script.code));
            };

            test('hello', ['$out+="hello"']);
            test('<%=value%>', ['$out+=$escape(value)']);

            test('hello<%=value%>', ['$out+="hello"', '$out+=$escape(value)']);
            test('hello\n<%=value%>', ['$out+="hello\\n"', '$out+=$escape(value)']);

            test('<% if (value) { %>\nhello\n<% } %>', ['if (value) {', '$out+="\\nhello\\n"', '}']);
        }
    },

    'parseString': {
        'basic': () => {
            const test = (code, result, options) => {
                it(code, () => {
                    options = defaults.$extend(options);
                    options.source = '';
                    const compiler = new Compiler(options);
                    const token = compiler.getTplTokens(code, [ruleNative]);
                    compiler.parseString(token[0]);
                    assert.deepEqual(result, compiler.scripts.map(script => script.code));
                });
            };

            // raw
            test('hello', ['$out+="hello"']);
            test('\'hello\'', ['$out+="\'hello\'"']);
            test('"hello    world"', ['$out+="\\"hello    world\\""']);
            test('<div>hello</div>', ['$out+="<div>hello</div>"']);
            test('<div id="test">hello</div>', ['$out+="<div id=\\"test\\">hello</div>"']);

            // compressor
            test('  hello  ', ['$out+=" hello "'], { compressor });
            test('\n  hello  \n\n.', ['$out+=" hello ."'], { compressor });
            test('"hello    world"', ['$out+="\\"hello world\\""'], { compressor });
            test('\'hello    world\'', ['$out+="\'hello world\'"'], { compressor });
        },

        'parseExpression': () => {
            const test = (code, result, options) => {
                it(code, () => {
                    options = defaults.$extend(options);
                    options.source = '';
                    const compiler = new Compiler(options);
                    const token = compiler.getTplTokens(code, [ruleNative]);
                    compiler.parseExpression(token[0]);
                    assert.deepEqual(result, compiler.scripts.map(script => script.code));
                });
            };

            // v3 compat
            test('<%=value%>', ['$out+=$escape(value)']);
            test('<%=#value%>', ['$out+=value']);

            // v4
            test('<%-value%>', ['$out+=value']);
            test('<%- value %>', ['$out+= value']);

            test('<%=value%>', ['$out+=value'], { escape: false });
            test('<%-value%>', ['$out+=value'], { escape: false });

            test('<%if (value) {%>', ['if (value) {']);
            test('<% if (value) { %>', [' if (value) { ']);
            test('<%    if ( value ) {    %>', ['    if ( value ) {    '], {
                compressor
            });
        }
    },


    'checkExpression': {
        'basic': () => {
            const test = (code, result, options) => {
                options = defaults.$extend(options);
                options.source = code;
                const compiler = new Compiler(options);
                assert.deepEqual(result, compiler.checkExpression(code));
            };

            test('if(a){', true);
            test('for(var i in d){', true);
            test('list.forEach(function(a,b){', true);
            test('list.forEach((a,b)=>{', true);
            test('$each(user.tags,function($value,$index){;', true);
            test('}else if(a){', true);
            test('}else{', true);
            test('}', true);

            test('if(a){}', true);
            test('for(var i in d){}', true);
            test('list.forEach(function(a,b){})', true);
            test('list.forEach((a,b)=>{})', true);

            test('@if(a){', false);
            test('@for(var i in d){', false);
            test('@list.forEach(function(a,b){', false);
            test('@list.forEach((a,b)=>{', false);
        }
    },

    'build': {
        basic: () => {
            const test = (code, result, options) => {
                options = defaults.$extend(options);
                options.source = code;
                const compiler = new Compiler(options);
                compiler.build();
                assert.deepEqual(result, compiler.scripts.map(script => script.code));
            };

            test('hello', ['$out+="hello"']);
            test('<%=value%>', ['$out+=$escape(value)']);
            test('hello <%=value%>.', ['$out+="hello "', '$out+=$escape(value)', '$out+="."']);
            test('<%-value%>', ['$out+=value']);
            test('hello <%-value%>.', ['$out+="hello "', '$out+=value', '$out+="."']);

            test('hello<%=value%>', ['$out+="hello"', '$out+=$escape(value)']);
            test('hello\n<%=value%>', ['$out+="hello\\n"', '$out+=$escape(value)']);

            test('<% if (value) { %>\nhello\n<% } %>', ['if (value) {', '$out+="\\nhello\\n"', '}']);

            // compileDebug
            test('<%-value%>', ['$line=[0,0,\"<%-value%>\"]', '$out+=value'], {
                compileDebug: true
            });
            // CompileError
        },


        'CompileError': {
            'throw': () => {
                const options = Object.create(defaults);
                options.source = 'hello\n\n<% a b c d %>';
                const compiler = new Compiler(options);

                try {
                    compiler.build();
                } catch (e) {
                    assert.deepEqual('CompileError', e.name);
                    assert.deepEqual(3, e.line);
                }
            }
        }

    }
};