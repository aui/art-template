const assert = require('assert');
const ruleArt = require('../../../lib/compile/adapter/rule.art');
const esTokenizer = require('../../../lib/compile/es-tokenizer');

const callRule = code => {
    const compiler = {
        options: {},
        getEsTokens: esTokenizer
    };
    const list = code.match(ruleArt.test);
    list[0] = new String(list[0]);
    list[0].line = 0;
    list[0].start = 0;
    return ruleArt.use.apply(compiler, list);
}

module.exports = {
    before: () => {
        console.log('#compile/adapter/rule.art');
    },

    syntax: {
        'set': () => {
            assert.deepEqual({
                code: 'var a = b',
                output: false
            }, callRule(`{{set a = b}}`));

            assert.deepEqual({
                code: 'var a = b, c = 1',
                output: false
            }, callRule(`{{set a = b, c = 1}}`));
        },
        'if': () => {
            assert.deepEqual({
                code: 'if(value){',
                output: false
            }, callRule(`{{if value}}`));

            assert.deepEqual({
                code: 'if(a + b === 4){',
                output: false
            }, callRule(`{{if a + b === 4}}`));
        },
        'else if': () => {
            assert.deepEqual({
                code: '}else if(value){',
                output: false
            }, callRule(`{{else if value}}`));

            assert.deepEqual({
                code: '}else if(a + b === 4){',
                output: false
            }, callRule(`{{else if a + b === 4}}`));
        },
        '/if': () => {
            assert.deepEqual({
                code: '}',
                output: false
            }, callRule(`{{/if}}`));
        },
        'each': () => {
            assert.deepEqual({
                code: '$each($data,function($value,$index){',
                output: false
            }, callRule(`{{each}}`));

            assert.deepEqual({
                code: '$each(list,function($value,$index){',
                output: false
            }, callRule(`{{each list}}`));

            assert.deepEqual({
                code: '$each(list,function(val,$index){',
                output: false
            }, callRule(`{{each list val}}`));

            assert.deepEqual({
                code: '$each(list,function(val,key){',
                output: false
            }, callRule(`{{each list val key}}`));

            assert.deepEqual({
                code: '$each(list,function(val,key){',
                output: false
            }, callRule(`{{each list as val key}}`));

            assert.deepEqual({
                code: `$each(list['var'].a,function(val,key){`,
                output: false
            }, callRule(`{{each list['var'].a as val key}}`));
        },
        '/each': () => {
            assert.deepEqual({
                code: '})',
                output: false
            }, callRule(`{{/each}}`));
        },
        'block': () => {
            assert.deepEqual({
                code: `block('header',function(){`,
                output: false
            }, callRule(`{{block 'header'}}`));
        },
        'include': ()=> {
            assert.deepEqual({
                code: `include('header')`,
                output: false
            }, callRule(`{{include 'header'}}`));

            assert.deepEqual({
                code: `include('header',data)`,
                output: false
            }, callRule(`{{include 'header' data}}`));

            assert.deepEqual({
                code: `include('header',data)`,
                output: 'escape'
            }, callRule(`{{include('header',data)}}`));
        },
        'extend': ()=> {
            assert.deepEqual({
                code: `extend('header')`,
                output: false
            }, callRule(`{{extend 'header'}}`));

            assert.deepEqual({
                code: `extend('header')`,
                output: 'escape'
            }, callRule(`{{extend('header')}}`));
        }
    },

    'output': {
        'autoescape': () => {
            assert.deepEqual({
                code: 'value',
                output: 'escape'
            }, callRule(`{{value}}`));

            assert.deepEqual({
                code: 'typeof value',
                output: 'escape'
            }, callRule(`{{typeof value}}`));

            assert.deepEqual({
                code: 'value + 1',
                output: 'escape'
            }, callRule(`{{value + 1}}`));

            assert.deepEqual({
                code: 'value?a:b',
                output: 'escape'
            }, callRule(`{{value?a:b}}`));

            assert.deepEqual({
                code: 'value ? a : b',
                output: 'escape'
            }, callRule(`{{ value ? a : b }}`));
        },
        'raw': () => {
            assert.deepEqual({
                code: 'value',
                output: 'raw'
            }, callRule(`{{@value}}`));
        },
        'filter': () => {

            assert.deepEqual({
                code: `$imports.c($imports.b(a))`,
                output: 'escape'
            }, callRule(`{{a | b | c}}`));

            assert.deepEqual({
                code: `$imports.c($imports.b(a(9+9,54)))`,
                output: 'escape'
            }, callRule(`{{a(9 + 9, 54) | b | c}}`));

            assert.deepEqual({
                code: `$imports.c($imports.b(a,1),2)`,
                output: 'escape'
            }, callRule(`{{a | b 1 | c 2}}`));

            assert.deepEqual({
                code: `$imports.c($imports.b(a,1+3),2+4)`,
                output: 'escape'
            }, callRule(`{{a | b 1 + 3 | c 2 + 4}}`));

            assert.deepEqual({
                code: `$imports.dateFormat(time)`,
                output: 'escape'
            }, callRule(`{{time | dateFormat}}`));

            assert.deepEqual({
                code: `$imports.dateFormat(time,'yyyy-MM-dd')`,
                output: 'escape'
            }, callRule(`{{time | dateFormat 'yyyy-MM-dd'}}`));

            assert.deepEqual({
                code: `$imports.dateFormat(time,'yyyy-MM-dd')`,
                output: 'escape'
            }, callRule(`{{time | dateFormat:'yyyy-MM-dd'}}`));

            assert.deepEqual({
                code: `$imports.dateFormat(time,f?a.b[c]:y(),9.99)`,
                output: 'escape'
            }, callRule(`{{time | dateFormat f ? a.b[c] : y() 9.99}}`));

            assert.deepEqual({
                code: `$imports.dateFormat(time||Date.now(),'yyyy-MM-dd')`,
                output: 'escape'
            }, callRule(`{{time || Date.now() | dateFormat 'yyyy-MM-dd'}}`));
        }
    },

    'rule.art': {
        '_split': () => {
            let code;
            let esTokens;
            let result;

            code = 'a b c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a', 'b', 'c'], result);

            code = ' a b c ';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a', 'b', 'c'], result);

            code = 'a b   c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a', 'b', 'c'], result);

            code = 'a.b c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a.b', 'c'], result);

            code = 'a. b c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a.b', 'c'], result);

            code = 'a[b] c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a[b]', 'c'], result);

            code = 'a["b"] c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a["b"]', 'c'], result);

            code = 'a["b"][c] c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a["b"][c]', 'c'], result);

            code = 'a["b"].c d';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a["b"].c', 'd'], result);

            code = 'a[" b "] c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a[" b "]', 'c'], result);

            code = 'a + b c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a+b', 'c'], result);

            code = 'a - b c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a-b', 'c'], result);

            code = 'a * b c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a*b', 'c'], result);

            code = 'a / b c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a/b', 'c'], result);

            code = 'a + b + c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a+b+c'], result);

            code = 'a + b.f + c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a+b.f+c'], result);

            code = 'a ? b : c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a?b:c'], result);

            code = 'a ? b : c ? d : e';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a?b:c?d:e'], result);

            code = 'a.f ? b : c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a.f?b:c'], result);

            code = 'a . f ? b : c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a.f?b:c'], result);

            code = 'a ? b : c . d';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a?b:c.d'], result);

            code = 'a ? b : c e';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['a?b:c', 'e'], result);

            code = '(a + b) / c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['(a+b)/c'], result);

            code = '(a + b) / c[a]';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['(a+b)/c[a]'], result);

            code = '++ a c';
            esTokens = esTokenizer(code);
            result = ruleArt._split(esTokens);
            assert.deepEqual(['++a', 'c'], result);

        }
    }
};