const TYPE_STRING = 'string';
const TYPE_EXPRESSION = 'expression';
const TYPE_RAW = 'raw';
const TYPE_ESCAPE = 'escape';

function wrapString(token) {
    const value = new String(token.value);
    value.line = token.line;
    value.start = token.start;
    value.end = token.end;
    return value;
}

function Token(type, value, prevToken) {
    this.type = type;
    this.value = value;
    this.script = null;

    if (prevToken) {
        this.line = prevToken.line + prevToken.value.split(/\n/).length - 1;
        if (this.line === prevToken.line) {
            this.start = prevToken.end;
        } else {
            this.start = prevToken.value.length - prevToken.value.lastIndexOf('\n') - 1;
        }
    } else {
        this.line = 0;
        this.start = 0;
    }

    this.end = this.start + this.value.length;
}

/**
 * 将模板转换为 Tokens
 * @param {string}      source
 * @param {Object[]}    rules     @see defaults.rules
 * @param {Object}      context
 * @return {Object[]}
 */
const tplTokenizer = (source, rules, context = {}) => {
    const tokens = [new Token(TYPE_STRING, source)];

    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        const flags = rule.test.ignoreCase ? `ig` : `g`;
        const regexp = new RegExp(rule.test.source, flags);

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            let prevToken = tokens[i - 1];

            if (token.type !== TYPE_STRING) {
                continue;
            }

            let match,
                index = 0;
            const substitute = [];
            const value = token.value;

            while ((match = regexp.exec(value)) !== null) {
                if (match.index > index) {
                    prevToken = new Token(TYPE_STRING, value.slice(index, match.index), prevToken);
                    substitute.push(prevToken);
                }

                prevToken = new Token(TYPE_EXPRESSION, match[0], prevToken);
                match[0] = wrapString(prevToken);
                prevToken.script = rule.use.apply(context, match);
                substitute.push(prevToken);

                index = match.index + match[0].length;
            }

            if (index < value.length) {
                prevToken = new Token(TYPE_STRING, value.slice(index), prevToken);
                substitute.push(prevToken);
            }

            tokens.splice(i, 1, ...substitute);
            i += substitute.length - 1;
        }
    }

    return tokens;
};

tplTokenizer.TYPE_STRING = TYPE_STRING;
tplTokenizer.TYPE_EXPRESSION = TYPE_EXPRESSION;
tplTokenizer.TYPE_RAW = TYPE_RAW;
tplTokenizer.TYPE_ESCAPE = TYPE_ESCAPE;

module.exports = tplTokenizer;
