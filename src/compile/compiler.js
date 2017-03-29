const jsTokens = require('./js-tokens');
const tplTokens = require('./tpl-tokens');
const isKeyword = require('is-keyword-js');
const utils = require('./utils');

const has = (object, key) => {
    return object.hasOwnProperty(key);
};


class Compiler {
    constructor(source, options) {

        const openTag = options.openTag;
        const closeTag = options.closeTag;

        this.source = source;
        this.options = options;

        // 记录编译后生成的代码
        this.scripts = [];

        // 被注入的上下文
        this.context = { $out: '""' };

        // 函数参数列表
        this.argv = [`$data`, `$filename`, `$imports`, `$utils`];

        // 特权变量名
        this.spaceKey = [`$utils`, `$imports`];

        // 特权变量值
        this.spaceValue = [utils, options.imports];

        // 内置方法
        this.embedded = {
            print: `function(){var text=''.concat.apply('',arguments);return $out+=text}`,
            include: `function(filename,data){return $out+=$utils.$include(filename,data||$data,{$:$filename})}`
        };

        if (options.debug) {
            this.context.$line = '0';
        }


        tplTokens.parser(source, openTag, closeTag).forEach(token => {
            const type = token.type;
            const value = token.value;
            const line = token.line;
            if (type === `string`) {
                this.addString(value, line);
            } else if (type === `expression`) {
                this.addExpression(value, line);
            }
        });
    }

    // 注入上下文
    addContext(name) {

        let value = '';
        const argv = this.argv;
        const embedded = this.embedded;
        const context = this.context;

        if (has(context, name) || argv.includes(name) || isKeyword(name)) {
            return;
        }

        if (has(embedded, name)) {
            value = embedded[name];
        } else {

            // 分配变量到 `$utils`, `$imports`  内部的值
            const key = this.spaceKey.find((key, i) => {
                const val = this.spaceValue[i];
                return has(val, name);
            });

            value = `${key ? key : '$data'}.${name}`;
        }

        context[name] = value;
    }


    // 添加一条字符串（HTML）直接输出语句
    addString(source) {

        // 压缩多余空白与注释
        if (this.options.compress) {
            source = source
                .replace(/\s+/g, ' ')
                .replace(/<!--[\w\W]*?-->/g, '');
        }

        const code = `$out+=${JSON.stringify(source)}`;
        this.scripts.push(code);
    }


    // 添加一条逻辑表达式语句
    addExpression(source, line) {
        const options = this.options;
        const openTag = options.openTag;
        const closeTag = options.closeTag;
        const parser = options.parser;
        const debug = options.debug;
        const escape = options.escape;
        const escapeSymbol = options.escapeSymbol;
        const rawSymbol = options.rawSymbol;
        let code = source.replace(openTag, ``).replace(closeTag, ``);

        // v3 compat
        code = code.replace(/^=[=#]/, rawSymbol).replace(/^=/, escapeSymbol);

        const tokens = jsTokens.parser(code);


        // 将数据做为模板渲染函数的作用域
        jsTokens.namespaces(tokens).forEach(name => this.addContext(name));


        // 外部语法转换函数
        if (parser) {
            code = parser(code, options, tokens);
        }


        // 处理输出语句
        if (jsTokens.isOutputExpression(tokens)) {

            const firstToken = jsTokens.trimLeft(tokens)[0];
            const isRaw = firstToken.value === rawSymbol;
            const isEscape = firstToken.value === escapeSymbol;

            if (isRaw || isEscape) {
                tokens.shift();
                code = jsTokens.toString(tokens);
            }

            if (escape === false || isRaw) {
                code = `$string(${code})`;
                this.addContext(`$string`);
            } else {
                // !has(this.embedded, firstToken.value)
                code = `$escape(${code})`;
                this.addContext(`$escape`);
            }

            code = `$out+=${code}`;
        }

        if (debug) {
            this.scripts.push(`$line=${line}`);
        }

        this.scripts.push(code);
    }


    // 构建渲染函数
    build() {

        const options = this;
        const source = options.source;
        const context = this.context;

        const contextCode = 'var ' + Object.keys(context).map(name => {
            return `${name}=${context[name]}`;
        }).join(',');
        const scriptsCode = this.scripts.join(';\n');

        let code = [`"use strict"`, contextCode, scriptsCode, `return $out`].join(`;\n`);

        if (options.sourceURL) {
            code.push(`//# sourceURL=${options.sourceURL}`);
        }

        if (options.debug) {
            code = `
            try{
                ${code}
            }catch(e){
                throw {
                    path: $filename,
                    name: "Render Error",
                    message: e.message,
                    line: $line,
                    source: ${JSON.stringify(source)}.split(/\\n/)[$line-1].replace(/^\\s+/,")
                };
            }
            `;
        }

        try {
            return new Function(this.argv, code);
        } catch (e) {
            // 编译失败，语法错误
            throw {
                path: options.filename,
                name: 'Syntax Error',
                message: e.message,
                line: 0, // 动态构建的函数无法捕获错误
                source: scriptsCode,
                temp: `function anonymous(${this.argv.join(',')}) {${code}}`
            };
        }

    }
};


module.exports = Compiler;