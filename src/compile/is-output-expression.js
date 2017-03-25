/**
 * 判断是否为输出表达式
 * @param {Object[]} tokens
 * @return {string[]}
 */
const isOutputExpression = tokens => {
    const list = tokens.filter(token => {
        return token.type !== `whitespace` && token.type !== `comment`;
    });
    const firstToken = list[0];
    const lastToken = list[list.length - 1];
    return (firstToken.type === `punctuator` && firstToken.value.indexOf(`=`) === 0) || (lastToken.type !== `punctuator` || lastToken.value !== `{`);
};

module.exports = isOutputExpression;