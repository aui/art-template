const assert = require('assert');
const htmlMinifier = require('../../../src/compile/adapter/html-minifier');
const rules = [];
const htmlMinifierOptions = {
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    ignoreCustomFragments: []
};

module.exports = {
    before: () => {
        console.log('#compile/adapter/html-minifier');
    },

    'html-minifier': {
        'text': () => {
            const result = htmlMinifier('hello world', {
                rules,
                htmlMinifierOptions
            });
            assert.equal('hello world', result);
        },

        'tag': () => {
            let result;
            result = htmlMinifier('<div></div>   <a></a>', {
                rules,
                htmlMinifierOptions
            });
            assert.equal('<div></div><a></a>', result);

            result = htmlMinifier('hello   <div>world</div>', {
                rules,
                htmlMinifierOptions
            });
            assert.equal('hello<div>world</div>', result);
        },

        'script': () => {
            const result = htmlMinifier('<script>var x = "     ";</script>', {
                rules,
                htmlMinifierOptions
            });
            assert.equal('<script>var x="     "</script>', result);
        },

        'html fragment': () => {
            let result;

            result = htmlMinifier('hello   <div>world', {
                rules,
                htmlMinifierOptions
            });
            assert.equal('hello<div>world</div>', result);
        },

        'throw error': () => {
            let result = null;
            try {
                result = htmlMinifier('<div ', {
                    rules,
                    htmlMinifierOptions
                });
            } catch (e) {}
            assert.equal(null, result);
        }
    }
};