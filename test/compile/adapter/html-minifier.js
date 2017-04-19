const assert = require('assert');
const htmlMinifier = require('../../../src/compile/adapter/html-minifier');


module.exports = {
    before: () => {
        console.log('#compile/adapter/html-minifier');
    },

    'html-minifier': {
        'text': () => {
            const result = htmlMinifier('hello world');
            assert.equal('hello world', result);
        },

        'tag': () => {
            let result;
            result = htmlMinifier('<div></div>   <a></a>');
            assert.equal('<div></div><a></a>', result);

            result = htmlMinifier('hello   <div>world</div>');
            assert.equal('hello<div>world</div>', result);
        },

        'script': () => {
            const result = htmlMinifier('<script>var x = "     ";</script>');
            assert.equal('<script>var x="     "</script>', result);
        },

        'html fragment': () => {
            let result;

            result = htmlMinifier('hello   <div>world');
            assert.equal('hello<div>world</div>', result);
        },

        'throw error': () => {
            let result = null;
            try {
                result = htmlMinifier('<div ');
            } catch(e) {}
            assert.equal(null, result);
        }
    }
};