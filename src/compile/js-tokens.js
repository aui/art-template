const jsTokens = require('js-tokens').default;
const matchToToken = require('js-tokens').matchToToken;
const isKeyword = require('is-keyword-js');

/**
 * 将逻辑表达式解释为 Tokens
 * @param {string} code
 * @return {Object[]}
 */
const toTokens = code => {
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

module.exports = toTokens;