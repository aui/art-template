const jsTokens = require('./js-tokens');

const TYPE_STRING = 'string';
const TYPE_EXPRESSION = 'expression';
const TYPE_RAW = 'RAW';
const TYPE_ESCAPE = 'ESCAPE';



/**
 * 将模板转换为 Tokens
 * @param {string} source 
 * @param {array} syntax @see defaults.syntax
 * @return {Object[]}
 */
const parser = (source, syntax) => {

    // TODO column
    let line = 1;
    const tokens = [];
    const escapeReg = string => string.replace(/(.)/g, '\\$1');
    const syntaxReg = syntax.map(tag => `(${escapeReg(tag.open)}[\\w\\W]*?${escapeReg(tag.close)})`);
    const SYNTAX = new RegExp(syntaxReg.join('|') + '|(^$|[\\w\\W])', 'g');

    source.match(SYNTAX).forEach(item => {
        SYNTAX.lastIndex = 0;
        const match = SYNTAX.exec(item);

        let cursor = 0;
        const lastToken = tokens[tokens.length - 1];
        const value = match[0];
        const token = { type: TYPE_STRING, value, line };

        line += value.split(/\n/).length - 1;

        while (cursor < syntax.length) {
            if (match[cursor + 1]) {

                const tag = syntax[cursor];
                const open = tag.open;
                const close = tag.close;
                const code = value.slice(open.length, value.length - close.length);
                const output = {
                    [tag.raw]: TYPE_RAW,
                    [tag.escape]: TYPE_ESCAPE
                };

                token.type = TYPE_EXPRESSION;

                token.syntax = tag.name;
                token.output = output[code.slice(0, 1)] || false; // tag.raw 与 tag.escape 只允许一个字符
                token.code = token.output ? code.slice(1) : code;
                token.tokens = jsTokens.parser(token.code);
                token.variables = jsTokens.getVariables(token.tokens);
                token.parser = tag.parser;

                break;
            }

            cursor++;
        }


        if (lastToken && lastToken.type === TYPE_STRING && token.type === TYPE_STRING) {
            // 连接字符串
            lastToken.value += token.value;
        } else {
            tokens.push(token);
        }

    });

    return tokens;
};



module.exports = {
    parser,
    TYPE_STRING,
    TYPE_EXPRESSION,
    TYPE_RAW,
    TYPE_ESCAPE
};