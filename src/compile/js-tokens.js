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
 * 获取命名空间
 * @param {Object[]} tokens
 * @return {string[]}
 */
const variables = tokens => {
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



// 根据索引删除列表中空白与注释 token
const trimByIndex = (tokens, index) => {
    const token = tokens[index];
    const isRemove = !!token && (token.type === `whitespace` || token.type === `comment`);
    if (isRemove) {
        tokens.splice(index, 1);
    }

    return isRemove;
};



/**
 * 删除左边空白与注释
 * @param {Object[]} tokens 
 */
const trimLeft = tokens => {
    tokens = [].concat(...tokens);
    while (trimByIndex(tokens, 0)) {}
    return tokens;
};


/**
 * 删除右边空白与注释
 * @param {Object[]} tokens 
 */
const trimRight = tokens => {
    tokens = [].concat(...tokens);
    while (trimByIndex(tokens, tokens.length - 1)) {}
    return tokens;
};


/**
 * 删除左右边空白与注释
 * @param {Object[]} tokens 
 */
const trim = tokens => {
    tokens = trimLeft(tokens);
    return trimRight(tokens);
};


/**
 * 将 tokens 还原为源代码
 * @param {Object[]} tokens 
 * @returns {string}
 */
const toString = tokens => {
    return tokens.map(token => token.value).join('');
};


module.exports = {
    parser,
    variables,
    trimLeft,
    trimRight,
    trim,
    toString
};