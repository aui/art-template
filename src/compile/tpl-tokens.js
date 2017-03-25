/**
 * 将模板转换为 Tokens
 * @param {string} source 
 * @param {string} openTag 
 * @param {string} closeTag
 * @return {Object[]}
 */
const parser = (source, openTag, closeTag) => {

    const tokens = [];
    source.split(openTag).forEach(code => {

        // code: [string] || [expression, string]
        code = code.split(closeTag);

        if (code.length > 1) {
            tokens.push({
                type: 'expression',
                value: openTag + code.shift() + closeTag
            });
        }

        if (code[0]) {
            tokens.push({
                type: 'string',
                value: code[0]
            });
        }

    });

    return tokens;
};



module.exports = {
    parser
};