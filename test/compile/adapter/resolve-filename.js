const assert = require('assert');
const resolveFilename = require('../../../src/compile/adapter/resolve-filename');

module.exports = {
    before: () => {
        console.log('#compile/adapter/resolve-filename');
    },

    'resolveFilename': {
        'basic': () => {
            const test = (args, result) => {
                assert.deepEqual(result, resolveFilename(...args));
            };

            test(['header.html', '/'], '/header.html');
            test(['header.html', '/Root'], '/Root/header.html');
            test(['header.html', '/Root', '/Root/base/index.html'], '/Root/base/header.html');
            test(['header.html', '/Root', '/Web/base/index.html'], '/Web/base/header.html');

            test(['./header.html', '/'], '/header.html');
            test(['./header.html', '/Root'], '/Root/header.html');
            test(['./header.html', '/Root', '/Root/base/index.html'], '/Root/base/header.html');
            test(['./header.html', '/Root', '/Web/base/index.html'], '/Web/base/header.html');

            test(['../../header.html', '/'], '/header.html');
            test(['../../header.html', '/Root'], '/header.html');
            test(['../../header.html', '/Root', '/Root/base/index.html'], '/header.html');
            test(['../../header.html', '/Root', '/Web/base/index.html'], '/header.html');

            test(['/header.html', '/'], '/header.html');
            test(['/header.html', '/Root'], '/header.html');
            test(['/header.html', '/Root', '/Root/base/index.html'], '/header.html');
            test(['/header.html', '/Root', '/Web/base/index.html'], '/header.html');
        }
    }
};