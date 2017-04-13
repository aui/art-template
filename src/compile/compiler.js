const esTokenizer = require('./es-tokenizer');
const tplTokenizer = require('./tpl-tokenizer');
const isKeyword = require('is-keyword-js');

const DATA = `$data`;
const IMPORTS = `$imports`;
const has = (object, key) => object.hasOwnProperty(key);
const stringify = JSON.stringify;

class Compiler {

    /**
     * 模板编译器
     * @param   {Object}    options
     */
    constructor(options) {

        const filename = options.filename;
        const root = options.root;
        const source = options.source;

        this.options = options;

        // 记录编译后生成的代码
        this.scripts = [];

        // 运行时注入的上下文
        this.context = {};

        // 内置变量
        this.internal = {
            $out: `""`,
            $line: `[0,0,0,""]`,
            print: `function(){var text=''.concat.apply('',arguments);return $out+=text}`,
            include: `function(src,data){return $out+=$imports.$include(src,data||${DATA},${stringify(filename)},${stringify(root)})}`
        };


        this.importContext(`$out`);

        if (options.compileDebug) {
            this.importContext(`$line`);
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
     * @return {array}
     */
    getTplTokens(...args){
        return tplTokenizer(...args);
    }



    /**
     * 将模板表达式转换成 esToken 数组
     * @param   {string} source 
     * @return {array}
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
     * @memberOf Compiler
     */
    importContext(name) {

        let value = ``;
        const internal = this.internal;
        const context = this.context;
        const options = this.options;
        const imports = options.imports;


        if (has(context, name) || name === DATA || name === IMPORTS || isKeyword(name)) {
            return;
        }

        if (has(internal, name)) {
            value = internal[name];
        } else if (has(imports, name)) {
            value = `${IMPORTS}.${name}`;
        } else {
            value = `${DATA}.${name}`;
        }


        context[name] = value;
    }



    /**
     * 解析字符串（HTML）直接输出语句
     * @param {Object} tplToken 
     */
    parseString(tplToken) {

        let source = tplToken.value;
        const options = this.options;
        const compressor = options.compressor;

        if (compressor) {
            source = compressor(source);
        }

        const code = `$out+=${stringify(source)}`;
        this.scripts.push({ source, tplToken, code });
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
        const variables = script.variables || [];
        let code = script.code.trim();


        if (!script.variables) {
            const esToken = this.getEsTokens(code);
            variables.push(...this.getVariables(esToken));
        }


        if (output) {
            if (escape === false || output === tplTokenizer.TYPE_RAW) {
                code = `$out+=${script.code}`;
            } else {
                code = `$out+=$escape(${script.code})`;
                variables.push(`$escape`);
            }
        }


        if (compileDebug) {
            const lineData = [line, start, stringify(source)].join(',');
            this.scripts.push({ source, tplToken, code: `$line=[${lineData}]` });
        }


        variables.forEach(name => this.importContext(name));
        this.scripts.push({ source, tplToken, code });
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
            [/^\s*}.*?{?\s*$/, ''],

            // <% list.forEach(function(a,b){ %>
            [/(^.*?\(\s*function\s*\(.*?\)\s*{\s*$)/, '$1})'],

            // <% list.forEach((a,b)=>{ %>
            [/(^.*?\(\s*.*=>\s*{\s*$)/, '$1})'],

            // <% if(a){ %>
            // <% for(var i in d){ %>
            [/(^.*?\(.*?\)\s*{\s*$)/, '$1}']

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


        const useStrictCode = `"use strict"`;
        const contextCode = `var ` + Object.keys(context).map(name => `${name}=${context[name]}`).join(`,`);
        const scriptsCode = scripts.map(script => script.code).join(`;\n`);
        const returnCode = `return $out`;

        let renderCode = [
            useStrictCode,
            contextCode,
            scriptsCode,
            returnCode
        ].join(`;\n`);


        if (options.compileDebug) {
            const throwCode = '{' + [
                `path:${stringify(filename)}`,
                `name:"RuntimeError"`,
                `message:e.message`,
                `line:$line[0]+1`,
                `start:$line[1]+1`,
                `source:$line[2]`,
                `stack:e.stack`
            ].join(`,`) + '}';
            renderCode = `try{${renderCode}}catch(e){throw ${throwCode}}`;
        }

        renderCode = `function(${DATA}){\n${renderCode}\n}`;


        try {
            return new Function(IMPORTS, `return ${renderCode}`)(imports);
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
                line,
                start,
                source: source2,
                script: renderCode,
                stack: e.stack
            };
        }

    }
};



module.exports = Compiler;