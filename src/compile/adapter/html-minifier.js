const detectNode = require('detect-node');

/**
 * HTML 压缩器 
 * @param  {string}     source
 * @param  {Object}     options
 * @return {string}
 */
const htmlMinifier = (source, options) => {
    if (detectNode) {
        
        const htmlMinifier = require('html-minifier').minify;
        const htmlMinifierOptions = options.htmlMinifierOptions;
        const ignoreCustomFragments = options.rules.map(rule => rule.test);
        htmlMinifierOptions.ignoreCustomFragments.push(...ignoreCustomFragments);
        source = htmlMinifier(source, htmlMinifierOptions);
    }

    return source;
};

module.exports = htmlMinifier;