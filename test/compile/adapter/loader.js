const assert = require('assert');
const tplLoader = require('../../../lib/compile/adapter/loader');
const path = require('path');

module.exports = {
    before: () => {
        console.log('#compile/adapter/loader');
    },
    'loader': {
        'read file': () => {
            const filename = path.resolve(__dirname, '..', '..', 'res', 'file.html');
            assert.deepEqual('hello world', tplLoader(filename));
        }
    }
};