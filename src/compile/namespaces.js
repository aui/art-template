/**
 * 获取命名空间
 * @param {Object[]} tokens
 * @return {string[]}
 */
const namespaces = tokens => {
    let ignore = false;
    return tokens.filter(token => {
        return token.type !== `whitespace` && token.type !== `comment`;
    }).filter(token => {
        if (token.type === `name` && !ignore) {
            return true;
        }

        if (token.type === `punctuator` && token.value === `.`) {
            ignore = true;
        } else {
            ignore = false;
        }

        return false;
    }).map(tooken => tooken.value);
};

module.exports = namespaces;