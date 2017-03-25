const jsTokens = require('./js-tokens');
const tplTokens = require('./tpl-tokens');
const namespaces = require('./namespaces');
const isOutputExpression = require('./is-output-expression');
const utils = require('./utils');

class Compiler {

    constructor(options) {
        this.options = options;
        this.line = 0;
        this.scripts = [];
        this.sources = [];
        this.context = { $utils: `$centext.$utils`, $out: '""' };

        if (options.debug) {
            this.context.$line = '0';
        }
    }

    addContext(key) {

        let value = '';
        const contextNames = [`$filename`, `$filters`, `$utils`];
        const print = `function(){var text=''.concat.apply('',arguments);return $out+=text}`;
        const include = `function(filename,data){data=data||$data;var text=$include(filename,data,$filename);return $out+=text}`;

        if (this.hasOwnProperty(key)) {
            return;
        }

        if (name === 'print') {

            value = print;

        } else if (name === 'include') {

            value = include;

        } else if (utils[name]) {

            value = `$utils.${name}`;

        } else if (contextNames.include(name)) {

            value = `$content.${name}`;

        } else {

            value = `$data[${JSON.stringify(name)}]`;
        }

        this.context[key] = value;
    }

    addString(source) {
        const code = `$out+=${JSON.stringify(source)}`;
        this.line += source.split(/\n/).length;
        this.scripts.push(code);
    }

    addExpression(source) {
        const options = this.options;
        const openTag = options.openTag;
        const closeTag = options.closeTag;
        const parser = options.parser;
        const debug = options.debug;

        const startLine = openTag.split(/\n/).length;

        let code = source.replace(openTag, ``).replace(closeTag, ``);
        const tokens = jsTokens(code);


        // 将数据做为模板渲染函数的作用域
        namespaces(tokens).forEach(name => this.addContext(name));


        // 外部语法转换函数
        if (parser) {
            code = parser(code, options, tokens);
        }


        // 处理输出语句
        if (isOutputExpression(tokens)) {

            if (/^=[=#]/.test(code)) {
                console.warn(`请使用 "=>" 代替 "=#"`);
            }

            const isEscapeSyntax = escape && !/^=>/.test(code);

            code = code.replace(/^=>?|[\s;]*$/g, '');



            // todo 排除 utils.* | include | print 的编码
            if (isEscapeSyntax) {

                // 

                code = `$escape(${code})`;
            } else {
                code = `$string(${code})`;
            }

            code = `$out+=${code}`;
        }

        if (debug) {
            this.scripts.push(`$line=${startLine}`);
        }

        this.line += source.split(/\n/).length;
        this.scripts.push(code);
    }

    addSource(source) {
        const options = this.options;
        const openTag = options.openTag;
        const closeTag = options.closeTag;

        this.sources.push(source);

        tplTokens(source, openTag, closeTag).forEach(token => {
            if (token.type === `string`) {
                this.addString(token.value);
            } else if (token.type === `expression`) {
                this.addExpression(token.value);
            }
        });
    }

    build() {
        const context = this.context;
        const options = this.options;
        const contextCode = 'var ' + Object.keys(context).map(name => {
            return `${name}=${context[name]}`;
        }).join(',');
        const scriptsCode = this.scripts.join(';\n');

        let code = [`"use strict"`, contextCode, scriptsCode, `return $out`].join(`;\n`);

        if (options.debug) {
            code = `
            try{
                ${code}
            }catch(e){
                throw {
                    filename: $filename,
                    name: "Render Error",
                    message: e.message,
                    line: $line,
                    source: ${JSON.stringify(scriptsCode)}
                                .split(/\\n/)[$line-1].replace(/^\\s+/,")
                };
            }
            `;
        }

        try {
            // $centext: $filename | $filters | $utils
            return new Function(`$data`, `$centext`, code);
        } catch (e) {
            // 编译失败，语法错误
            throw {
                filename: options.filename,
                name: 'Syntax Error',
                message: e.message,
                line: 0, // 动态构建的函数无法捕获错误
                source: scriptsCode,
                temp: `function anonymous($data,$centext) {${code}}`
            };
        }

    }
};


module.exports = Compiler;