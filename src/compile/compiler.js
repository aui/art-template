const jsTokens = require('./js-tokens');
const tplTokens = require('./tpl-tokens');
const isKeyword = require('is-keyword-js');

const DATA = `$data`;
const IMPORTS = `$imports`;
const has = (object, key) => object.hasOwnProperty(key);
const stringify = JSON.stringify;


class Compiler {
    constructor(options) {

        const openTag = options.openTag;
        const closeTag = options.closeTag;
        const filename = options.filename;
        const root = options.root;
        const source = options.source;

        this.source = source;
        this.options = options;

        // 记录编译后生成的代码
        this.scripts = [];

        this.stack = [];

        // 运行时注入的上下文
        this.context = {};

        // 内置变量
        this.internal = {
            $out: `""`,
            $line: `[0,""]`,
            print: `function(){var text=''.concat.apply('',arguments);return $out+=text}`,
            include: `function(src,data){return $out+=$imports.$include(src,data||${DATA},${stringify(filename)},${stringify(root)})}`
        };


        this.parseContext(`$out`);

        if (options.compileDebug) {
            this.parseContext(`$line`);
        }


        tplTokens.parser(source, openTag, closeTag).forEach(token => {
            const type = token.type;
            const value = token.value;
            const line = token.line;
            if (type === `string`) {
                this.parseString(value, line);
            } else if (type === `expression`) {
                this.parseExpression(value, line);
            }
        });

    }

    // 解析上下文
    parseContext(name) {

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


    // 解析字符串（HTML）直接输出语句
    parseString(source, line) {
        const options = this.options;
        const parseString = options.parseString;

        if (parseString) {
            source = parseString({ line, source, compiler: this });
        }

        const code = `$out+=${stringify(source)}`;
        this.scripts.push(code);
    }


    // 解析逻辑表达式语句
    parseExpression(source, line) {

        const options = this.options;
        const openTag = options.openTag;
        const closeTag = options.closeTag;
        const parseExpression = options.parseExpression;
        const compileDebug = options.compileDebug;
        const escape = options.escape;
        const escapeSymbol = options.escapeSymbol;
        const rawSymbol = options.rawSymbol;
        const expression = source.replace(openTag, ``).replace(closeTag, ``);

        // ... v3 compat ...
        let code = expression.replace(/^=[=#]/, rawSymbol).replace(/^=/, escapeSymbol);

        const tokens = jsTokens.trim(jsTokens.parser(code));

        // 将数据做为模板渲染函数的作用域
        jsTokens.namespaces(tokens).forEach(name => this.parseContext(name));


        // 外部语法转换函数
        if (parseExpression) {
            code = parseExpression({ tokens, line, source, compiler: this });
        }


        // 处理输出语句
        const firstToken = tokens[0];
        const isRaw = firstToken && firstToken.value === rawSymbol;
        const isEscape = firstToken && firstToken.value === escapeSymbol;
        const isOutput = isRaw || isEscape;

        if (isOutput) {
            tokens.shift();
            code = jsTokens.toString(tokens);

            if (escape === false || isRaw) {
                code = `$out+=${code}`;
            } else {
                code = `$out+=$escape(${code})`;
                this.parseContext(`$escape`);
            }
        }


        if (compileDebug) {
            this.scripts.push(`$line=[${line},${stringify(source)}]`);
        }


        this.stack.push({ source, code, line });
        this.scripts.push(code);
    }



    // 检查逻辑表达式语法
    checkExpression(source) {

        const oneLine = source.split(/\n/).length === 1;

        // 单行模板自动补全语法
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

        if (oneLine) {
            let index = 0;
            while (index < rules.length) {
                if (rules[index][0].test(source)) {
                    source = source.replace(...rules[index]);
                    break;
                }
                index++;
            };
        }

        try {
            new Function(source);
            return true;
        } catch (e) {
            return false;
        }
    }




    // 构建渲染函数
    build() {

        const options = this.options;
        const context = this.context;
        const source = this.source;
        const filename = options.filename;
        const imports = options.imports;


        const useStrictCode = `"use strict"`;
        const contextCode = `var ` + Object.keys(context).map(name => `${name}=${context[name]}`).join(`,`);
        const scriptsCode = this.scripts.join(`;\n`);
        const returnCode = `return $out`;


        let renderCode = [
            useStrictCode,
            contextCode,
            scriptsCode,
            returnCode
        ].join(`;\n`);


        // 插入运行时调试语句
        if (options.compileDebug) {
            const throwCode = '{' + [
                `path:${stringify(filename)}`,
                `name:"Runtime Error"`,
                `message:e.message`,
                `line:$line[0]`,
                `source:$line[1]`,
                `stack:e.stack`
            ].join(`,`) + '}';
            renderCode = `try{${renderCode}}catch(e){throw ${throwCode}}`;
        }

        renderCode = `function (${DATA}) {${renderCode}}`;


        try {
            return new Function(IMPORTS, `return ${renderCode}`)(imports);
        } catch (e) {

            let index = 0;
            let line = 0;
            let source2 = source;
            let stack = this.stack;

            while (index < stack.length) {
                if (!this.checkExpression(stack[index].code)) {
                    source2 = stack[index].source;
                    line = stack[index].line;
                    break;
                }
                index++;
            };

            throw {
                path: filename,
                name: `Compile Error`,
                message: e.message,
                line,
                source: source2,
                script: renderCode,
                stack: e.stack
            };
        }

    }
};



module.exports = Compiler;