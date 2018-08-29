const assert = require('assert');
const tplLoader = require('../../../src/compile/adapter/loader');
const path = require('path');

module.exports = {
    loader: {
        'read file': () => {
            const filename = path.resolve(__dirname, '..', '..', 'res', 'file.html');
            assert.deepEqual('hello world', tplLoader(filename));
        }
    }
};
