const TYPE_STRING = 'string';
const TYPE_EXPRESSION = 'expression';
const TYPE_RAW = 'RAW';
const TYPE_ESCAPE = 'ESCAPE';



/**
 * 将模板转换为 Tokens
 * @param {string}  source 
 * @param {array}   syntax @see defaults.syntax
 * @param {Object}  context
 * @return {Object[]}
 */
const parser = (source, rules, context) => {

    const tokens = [{
        type: TYPE_STRING,
        value: source,
        line: 1
    }];


    const walk = rule => {
        const test = rule.test;
        const use = rule.use;
        const group = new RegExp(`${test.source}|^$|[\\w\\W]`, `g`);

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const type = token.type;
            let line = 1;

            if (type !== TYPE_STRING) {
                line += token.value.split(/\n/).length - 1;
                continue;
            }

            const matchs = token.value.match(group);
            const substitute = [];

            for (let m = 0; m < matchs.length; m++) {
                let value = matchs[m];

                test.lastIndex = 0;

                const values = test.exec(value);
                const type = values ? TYPE_EXPRESSION : TYPE_STRING;


                if (type === TYPE_STRING) {

                    const lastToken = substitute[substitute.length - 1];

                    if (lastToken && lastToken.type === TYPE_STRING) {

                        // 连接连续的字符串
                        lastToken.value += value;

                    } else {

                        const token = { type, value, line };
                        substitute.push(token);

                    }

                } else {

                    const match = values.slice(1);
                    const script = use(match, context);
                    const token = { type, value, line, script };
                    substitute.push(token);

                }

                line += value.split(/\n/).length - 1;
            }


            tokens.splice(i, 1, ...substitute);
            i += substitute.length - 1;

        }
    };


    for (let i = 0; i < rules.length; i++) {
        walk(rules[i]);
    }

    return tokens;
};



module.exports = {
    parser,
    TYPE_STRING,
    TYPE_EXPRESSION,
    TYPE_RAW,
    TYPE_ESCAPE
};