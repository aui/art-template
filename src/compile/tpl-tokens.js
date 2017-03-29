/**
 * 将模板转换为 Tokens
 * @param {string} source 
 * @param {string} openTag 
 * @param {string} closeTag
 * @return {Object[]}
 */
const parser = (source, openTag, closeTag) => {

    const tokens = [];
    let line = 1;
    source.split(openTag).forEach(code => {

        // code: [string] || [expression, string]
        code = code.split(closeTag);

        if (code.length > 1) {
            const value = openTag + code.shift() + closeTag;

            tokens.push({
                type: 'expression',
                value: value,
                line: line
            });

            line += value.split(/\n/).length - 1;
        }

        if (code[0]) {
            const value = code[0];

            tokens.push({
                type: 'string',
                value: value,
                line: line
            });

            line += value.split(/\n/).length - 1;
        }

    });

    return tokens;
};



module.exports = {
    parser
};