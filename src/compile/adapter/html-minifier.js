const detectNode = require('detect-node');

/**
 * HTML 压缩器 
 * @param  {string}     source
 * @param  {RegExp[]}   ignoreCustomFragments
 * @return {string}
 */
const htmlMinifier = (source, ignoreCustomFragments = []) => {
    if (detectNode) {
        const htmlMinifier = require('html-minifier').minify;
        const options = {
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            ignoreCustomFragments
        };
        
        return htmlMinifier(source, options);
    } else {
        return source;
    }
};

module.exports = htmlMinifier;