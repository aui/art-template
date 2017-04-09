/**
 * 将模板转换为 Tokens
 * @param {string} source 
 * @param {array} syntax @see defaults.syntax
 * @return {Object[]}
 */
const parser = (source, syntax) => {

    // todo column
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
        const type = 'string';
        const value = match[0];
        const token = { type, value, line };

        line += value.split(/\n/).length - 1;

        while (cursor < syntax.length) {
            if (match[cursor + 1]) {

                const tag = syntax[cursor];
                const open = tag.open;
                const close = tag.close;
                const code = value.slice(open.length, value.length - close.length);
                const output = {
                    [tag.raw]: 'RAW',
                    [tag.escape]: 'ESCAPE'
                };

                token.type = 'expression';
                token.syntax = tag.name;
                token.output = output[code.slice(0, 1)] || false; // tag.raw 与 tag.escape 只允许一个字符
                token.code = token.output ? code.slice(1) : code;
                token.parser = tag.parser;

                break;
            }

            cursor++;
        }


        if (lastToken && lastToken.type === 'string' && token.type === 'string') {
            // 连接字符串
            lastToken.value += token.value;
        } else {
            tokens.push(token);
        }

    });

    return tokens;
};


module.exports = {
    parser
};