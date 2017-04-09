const jsTokens = require('js-tokens').default;
const matchToToken = require('js-tokens').matchToToken;
const isKeyword = require('is-keyword-js');

/**
 * 将逻辑表达式解释为 Tokens
 * @param {string} code
 * @return {Object[]}
 */
const parser = code => {
    return code.match(jsTokens).map(value => {
        jsTokens.lastIndex = 0;
        return matchToToken(jsTokens.exec(value));
    }).map(token => {
        if (token.type === 'name' && isKeyword(token.value)) {
            token.type = 'keyword';
        }
        return token;
    });
};


/**
 * 获取变量列表
 * @param {Object[]} tokens
 * @return {string[]}
 */
const getVariables = tokens => {
    let ignore = false;
    return tokens.filter(token => {
        return token.type !== `whitespace` && token.type !== `comment`;
    }).filter(token => {
        if (token.type === `name` && !ignore) {
            return true;
        }

        ignore = token.type === `punctuator` && token.value === `.`;

        return false;
    }).map(tooken => tooken.value);
};


module.exports = {
    parser,
    getVariables
};