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
        const ignoreCustomFragments = options.rules.map(rule => rule.test);
        const setting = {
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            ignoreCustomFragments
        };
        
        source = htmlMinifier(source, setting);
    }

    return source;
};

module.exports = htmlMinifier;