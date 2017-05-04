'use strict';

var detectNode = require('detect-node');

/**
 * HTML 压缩器 
 * @param  {string}     source
 * @param  {Object}     options
 * @return {string}
 */
var htmlMinifier = function htmlMinifier(source, options) {
    if (detectNode) {
        var _htmlMinifierOptions$;

        var _htmlMinifier = require('html-minifier').minify;
        var htmlMinifierOptions = options.htmlMinifierOptions;
        var ignoreCustomFragments = options.rules.map(function (rule) {
            return rule.test;
        });
        (_htmlMinifierOptions$ = htmlMinifierOptions.ignoreCustomFragments).push.apply(_htmlMinifierOptions$, ignoreCustomFragments);
        source = _htmlMinifier(source, htmlMinifierOptions);
    }

    return source;
};

module.exports = htmlMinifier;