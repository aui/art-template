const esTokenizer = require('./es-tokenizer');
const tplTokenizer = require('./tpl-tokenizer');
const isKeyword = require('is-keyword-js');

const DATA= `$data`;
const IMPORTS= `$imports`;
const PRINT= `print`;
const INCLUDE= `include`;
const EXTEND= `extend`;
const BLOCK= `block`;
const OPTIONS= `$$options`;
const OUT= `$$out`;
const LINE= `$$line`;
const BLOCKS= `$$blocks`;
const FROM= `$$from`;
const LAYOUT= `$$layout`;
const ESCAPE = `$escape`;

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

        // 记录编译后生成的代码
        this.scripts = [];

        // 运行时注入的上下文
        this.context = [];

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
            // 字符串拼接
            [OUT]: `''`,

            // 调试记录 [line, start, source]
            [LINE]: `[0,0,'']`,

            // 所有“模板块”
            [BLOCKS]: `arguments[1]||{}`,

            // 继承的布局模板的文件地址
            [FROM]: `null`,

            // 导出布局模板函数
            [LAYOUT]: `function(){return ${IMPORTS}.$include(${FROM},${DATA},${BLOCKS},${OPTIONS})}`,

            // 文本输出函数
            [PRINT]: `function(){${OUT}+=''.concat.apply('',arguments)}`,

            // 包含子模板
            [INCLUDE]: `function(src,data,block){${OUT}+=${IMPORTS}.$include(src,data||${DATA},block,${OPTIONS})}`,

            // 继承布局模板
            [EXTEND]: `function(from){${FROM}=from}`,

            // 读写“模板块”
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
            } catch(error){}
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
        const line = tplToken.line;
        const start = tplToken.start;
        const options = this.options;
        const compileDebug = options.compileDebug;
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


        if (compileDebug) {
            const lineData = [line, start, stringify(source)].join(',');
            this.scripts.push({
                source,
                tplToken,
                code: `${LINE}=[${lineData}]`
            });
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
        const source = options.source;
        const filename = options.filename;
        const imports = options.imports;
        const extendMode = has(this.CONTEXT_MAP, EXTEND);

        const useStrictCode = `'use strict'`;
        const contextCode = `var ` + context.map(({
            name,
            value
        }) => `${name}=${value}`).join(`,`);
        const scriptsCode = scripts.map(script => script.code).join(`\n`);
        const returnCode = extendMode ? `return ${LAYOUT}()` : `return ${OUT}`;

        let renderCode = [
            useStrictCode,
            contextCode,
            scriptsCode,
            returnCode
        ].join(`\n`);


        if (options.compileDebug) {
            const throwCode = '{' + [
                `path:${stringify(filename)}`,
                `name:'RuntimeError'`,
                `message:error.message`,
                `line:${LINE}[0]+1`,
                `start:${LINE}[1]+1`,
                `source:${LINE}[2]`,
                `stack:error.stack`
            ].join(`,`) + '}';
            renderCode = `try{${renderCode}}catch(error){throw ${throwCode}}`;
        }

        renderCode = `function(${DATA}){\n${renderCode}\n}`;


        try {
            return new Function(IMPORTS, OPTIONS, `return ${renderCode}`)(imports, options);
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