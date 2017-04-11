const TYPE_STRING = 'string';
const TYPE_EXPRESSION = 'expression';
const TYPE_RAW = 'raw';
const TYPE_ESCAPE = 'escape';



/**
 * 将模板转换为 Tokens
 * @param {string}      source 
 * @param {Object[]}    rules     @see defaults.rules
 * @param {Object}      context
 * @return {Object[]}
 */
const tplTokenizer = (source, rules, context) => {

    const tokens = [{
        type: TYPE_STRING,
        value: source,
        line: 0,
        start: 0,
        end: source.length
    }];


    const walk = rule => {

        const flags = rule.test.ignoreCase ? `ig` : `g`;
        const pattern = `${rule.test.source}|^$|[\\w\\W]`;
        const group = new RegExp(pattern, flags);

        for (let index = 0; index < tokens.length; index++) {

            if (tokens[index].type !== TYPE_STRING) {
                continue;
            }


            let line = tokens[index].line;
            let start = tokens[index].start;
            let end = tokens[index].end;

            const matchs = tokens[index].value.match(group);
            const substitute = [];

            for (let m = 0; m < matchs.length; m++) {
                let value = matchs[m];

                rule.test.lastIndex = 0;

                const values = rule.test.exec(value);
                const type = values ? TYPE_EXPRESSION : TYPE_STRING;
                const lastSubstitute = substitute[substitute.length - 1];
                const lastToken = lastSubstitute || tokens[index];
                const lastValue = lastToken.value;


                if (lastToken.line === line) {
                    start = lastSubstitute ? lastSubstitute.end : start;
                } else {
                    start = lastValue.length - lastValue.lastIndexOf('\n') - 1;
                }


                end = start + value.length;

                const token = { type, value, line, start, end };

                if (type === TYPE_STRING) {

                    if (lastSubstitute && lastSubstitute.type === TYPE_STRING) {

                        lastSubstitute.value += value;
                        lastSubstitute.end += value.length;

                    } else {


                        substitute.push(token);

                    }

                } else {

                    const script = rule.use.apply(context, values);
                    token.script = script;
                    substitute.push(token);

                }

                line += value.split(/\n/).length - 1;
            }


            tokens.splice(index, 1, ...substitute);
            index += substitute.length - 1;

        }
    };


    for (let i = 0; i < rules.length; i++) {
        walk(rules[i]);
    }

    return tokens;
};


tplTokenizer.TYPE_STRING = TYPE_STRING;
tplTokenizer.TYPE_EXPRESSION = TYPE_EXPRESSION;
tplTokenizer.TYPE_RAW = TYPE_RAW;
tplTokenizer.TYPE_ESCAPE = TYPE_ESCAPE;


module.exports = tplTokenizer;