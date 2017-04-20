const assert = require('assert');
const htmlMinifier = require('../../../src/compile/adapter/html-minifier');


module.exports = {
    before: () => {
        console.log('#compile/adapter/html-minifier');
    },

    'html-minifier': {
        'text': () => {
            const result = htmlMinifier('hello world', {
                rules: []
            });
            assert.equal('hello world', result);
        },

        'tag': () => {
            let result;
            result = htmlMinifier('<div></div>   <a></a>', {
                rules: []
            });
            assert.equal('<div></div><a></a>', result);

            result = htmlMinifier('hello   <div>world</div>', {
                rules: []
            });
            assert.equal('hello<div>world</div>', result);
        },

        'script': () => {
            const result = htmlMinifier('<script>var x = "     ";</script>', {
                rules: []
            });
            assert.equal('<script>var x="     "</script>', result);
        },

        'html fragment': () => {
            let result;

            result = htmlMinifier('hello   <div>world', {
                rules: []
            });
            assert.equal('hello<div>world</div>', result);
        },

        'throw error': () => {
            let result = null;
            try {
                result = htmlMinifier('<div ', {
                    rules: []
                });
            } catch (e) {}
            assert.equal(null, result);
        }
    }
};