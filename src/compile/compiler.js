const isKeyword = require('is-keyword-js');
const esTokenizer = require('./es-tokenizer');
const tplTokenizer = require('./tpl-tokenizer');


/** 传递给模板的数据引用 */
const DATA = `$data`;

/** 外部导入的所有全局变量引用 */
const IMPORTS = `$imports`;

/**  $imports.$escape */
const ESCAPE = `$escape`;

/** 文本输出函数 */
const PRINT = `print`;

/** 包含子模板函数 */
const INCLUDE = `include`;

/** 继承布局模板函数 */
const EXTEND = `extend`;

/** “模板块”读写函数 */
const BLOCK = `block`;

/** 字符串拼接变量 */
const OUT = `$$out`;

/** 运行时逐行调试记录变量 [line, start, source] */
const LINE = `$$line`;

/** 所有“模板块”变量 */
const BLOCKS = `$$blocks`;

/** 继承的布局模板的文件地址变量 */
const FROM = `$$from`;

/** 导出布局模板函数 */
const LAYOUT = `$$layout`;

/** 编译设置变量 */
const OPTIONS = `$$options`;


const has = (object, key) => object.hasOwnProperty(key);
const stringify = JSON.stringify;

class Compiler {

    /**
     * 模板编译器
     * @param   {Object}    options
     */
    constructor(options) {


        let source = options.source;
        const minimize = options.minimize;
        const htmlMinifier = options.htmlMinifier;


        // 编译选项
        this.options = options;

        // 所有语句堆栈
        this.stacks = [];

        // 运行时注入的上下文
        this.context = [];

        // 模板语句编译后的代码
        this.scripts = [];

        // context map
        this.CONTEXT_MAP = {};

        // 外部变量名单
        this.external = {
            [DATA]: true,
            [IMPORTS]: true,
            [OPTIONS]: true
        };

        // 按需编译到模板渲染函数的内置变量
        this.internal = {

            [OUT]: `''`,
            [LINE]: `[0,0,'']`,
            [BLOCKS]: `arguments[1]||{}`,
            [FROM]: `null`,
            [LAYOUT]: `function(){return ${IMPORTS}.$include(${FROM},${DATA},${BLOCKS},${OPTIONS})}`,
            [PRINT]: `function(){${OUT}+=''.concat.apply('',arguments)}`,
            [INCLUDE]: `function(src,data,block){${OUT}+=${IMPORTS}.$include(src,data||${DATA},block,${OPTIONS})}`,
            [EXTEND]: `function(from){${FROM}=from}`,
            [BLOCK]: `function(name,callback){if(${FROM}){${OUT}='';callback();${BLOCKS}[name]=${OUT}}else{if(typeof ${BLOCKS}[name]==='string'){${OUT}+=${BLOCKS}[name]}else{callback()}}}`
        };

        // 内置函数依赖关系声明
        this.dependencies = {
            [PRINT]: [OUT],
            [INCLUDE]: [OUT, IMPORTS, DATA, OPTIONS],
            [EXTEND]: [FROM, /*[*/ LAYOUT /*]*/ ],
            [BLOCK]: [FROM, OUT, BLOCKS],
            [LAYOUT]: [IMPORTS, FROM, DATA, BLOCKS, OPTIONS]
        };


        this.importContext(OUT);

        if (options.compileDebug) {
            this.importContext(LINE);
        }


        if (minimize) {
            try {
                source = htmlMinifier(source, options);
            } catch (error) {}
        }


        this.getTplTokens(source, options.rules, this).forEach(tokens => {
            if (tokens.type === tplTokenizer.TYPE_STRING) {
                this.parseString(tokens);
            } else {
                this.parseExpression(tokens);
            }
        });

    }



    /**
     * 将模板代码转换成 tplToken 数组
     * @param   {string} source 
     * @return  {Object[]}
     */
    getTplTokens(...args) {
        return tplTokenizer(...args);
    }



    /**
     * 将模板表达式转换成 esToken 数组
     * @param   {string} source 
     * @return  {Object[]}
     */
    getEsTokens(source) {
        return esTokenizer(source);
    }



    /**
     * 获取变量列表
     * @param {Object[]} esTokens
     * @return {string[]}
     */
    getVariables(esTokens) {
        let ignore = false;
        return esTokens.filter(esToken => {
            return esToken.type !== `whitespace` && esToken.type !== `comment`;
        }).filter(esToken => {
            if (esToken.type === `name` && !ignore) {
                return true;
            }

            ignore = esToken.type === `punctuator` && esToken.value === `.`;

            return false;
        }).map(tooken => tooken.value);
    }



    /**
     * 导入模板上下文
     * @param {string} name 
     */
    importContext(name) {

        let value = ``;
        const internal = this.internal;
        const dependencies = this.dependencies;
        const external = this.external;
        const context = this.context;
        const options = this.options;
        const imports = options.imports;
        const contextMap = this.CONTEXT_MAP;

        if (!has(contextMap, name) && !has(external, name) && !isKeyword(name)) {

            if (has(internal, name)) {
                value = internal[name];

                if (has(dependencies, name)) {
                    dependencies[name].forEach(name => this.importContext(name));
                }

            } else if (has(imports, name)) {
                value = `${IMPORTS}.${name}`;
            } else {
                value = `${DATA}.${name}`;
            }

            contextMap[name] = value;
            context.push({
                name,
                value
            });
        }
    }



    /**
     * 解析字符串（HTML）直接输出语句
     * @param {Object} tplToken 
     */
    parseString(tplToken) {

        let source = tplToken.value;

        if (!source) {
            return;
        }

        const code = `${OUT}+=${stringify(source)}`;
        this.scripts.push({
            source,
            tplToken,
            code
        });
    }



    /**
     * 解析逻辑表达式语句
     * @param {Object} tplToken 
     */
    parseExpression(tplToken) {


        const source = tplToken.value;
        const script = tplToken.script;
        const output = script.output;
        let code = script.code.trim();


        if (output) {
            if (escape === false || output === tplTokenizer.TYPE_RAW) {
                code = `${OUT}+=${script.code}`;
            } else {
                code = `${OUT}+=${ESCAPE}(${script.code})`;
            }
        }


        const esToken = this.getEsTokens(code);
        this.getVariables(esToken).forEach(name => this.importContext(name));


        this.scripts.push({
            source,
            tplToken,
            code
        });
    }



    /**
     * 检查解析后的模板语句是否存在语法错误
     * @param  {string} script 
     * @return {boolean}
     */
    checkExpression(script) {

        // 没有闭合的块级模板语句规则
        const rules = [

            // <% } %>
            // <% }else{ %>
            // <% }else if(a){ %>
            [/^\s*?}.*?{?[\s;]*?$/, ''],

            // <% list.forEach(function(a,b){ %>
            [/(^[\w\W]*?\s*?function\s*?\([\w\W]*?\)\s*?{[\s;]*?$)/, '$1})'],

            // <% list.forEach((a,b)=>{ %>
            [/(^.*?\(\s*?[\w\W]*?=>\s*?{[\s;]*?$)/, '$1})'],

            // <% if(a){ %>
            // <% for(var i in d){ %>
            [/(^[\w\W]*?\([\w\W]*?\)\s*?{[\s;]*?$)/, '$1}']

        ];


        let index = 0;
        while (index < rules.length) {
            if (rules[index][0].test(script)) {
                script = script.replace(...rules[index]);
                break;
            }
            index++;
        };


        try {
            new Function(script);
            return true;
        } catch (e) {
            return false;
        }
    }



    /**
     * 编译
     * @return  {function}
     */
    build() {

        const options = this.options;
        const context = this.context;
        const scripts = this.scripts;
        const stacks = this.stacks;
        const source = options.source;
        const filename = options.filename;
        const imports = options.imports;
        const map = [];
        const extendMode = has(this.CONTEXT_MAP, EXTEND);

        const toMap = (line, script) => {
            map.push({
                generated: {
                    line,
                    start: 0
                },
                original: {
                    line: script.tplToken.line,
                    start: script.tplToken.start
                }
            });
            return script.code;
        };

        stacks.push(`function(${DATA}){`);
        stacks.push(`'use strict'`);
        stacks.push(`var ` + context.map(({
            name,
            value
        }) => `${name}=${value}`).join(`,`));


        if (options.compileDebug) {

            stacks.push(`try{`);

            scripts.forEach(script => {
                stacks.push(`${LINE}=[${[
                    script.tplToken.line,
                    script.tplToken.start,
                    stringify(script.source)
                ].join(',')}]`);
                stacks.push(toMap(stacks.length, script));
            });

            stacks.push(`}catch(error){`);

            stacks.push('throw {' + [
                `path:${stringify(filename)}`,
                `name:'RuntimeError'`,
                `message:error.message`,
                `line:${LINE}[0]+1`,
                `start:${LINE}[1]+1`,
                `source:${LINE}[2]`,
                `stack:error.stack`
            ].join(`,`) + '}');

            stacks.push(`}`);

        } else {
            scripts.forEach(script => {
                stacks.push(toMap(stacks.length, script));
            });
        }


        stacks.push(extendMode ? `return ${LAYOUT}()` : `return ${OUT}`);
        stacks.push(`}`);


        const renderCode = stacks.join(`\n`);

        try {
            const result = new Function(IMPORTS, OPTIONS, `return ${renderCode}`)(imports, options);
            result.map = map;
            return result;
        } catch (e) {

            let index = 0;
            let line = 0;
            let start = 0;
            let source2 = source;

            while (index < scripts.length) {
                const current = scripts[index];
                if (!this.checkExpression(current.code)) {
                    source2 = current.source;
                    line = current.tplToken.line;
                    start = current.tplToken.start;
                    break;
                }
                index++;
            };

            throw {
                path: filename,
                name: `CompileError`,
                message: e.message,
                line: line + 1,
                start: start + 1,
                source: source2,
                script: renderCode,
                stack: e.stack
            };
        }

    }
};


/**
 * 模板内置常量
 */
Compiler.CONSTS = {
    DATA,
    IMPORTS,
    PRINT,
    INCLUDE,
    EXTEND,
    BLOCK,
    OPTIONS,
    OUT,
    LINE,
    BLOCKS,
    FROM,
    LAYOUT,
    ESCAPE
};


module.exports = Compiler;