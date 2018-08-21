const assert = require('assert');
const resolveFilename = require('../../../src/compile/adapter/resolve-filename');

module.exports = {
    'resolveFilename': {
        'basic': () => {
            const test = (args, result) => {
                assert.deepEqual(result, resolveFilename(...args));
            };

            test(['header.html', {
                root: '/',
            }], '/header.html');

            test(['header.html', {
                root: '/Root'
            }], '/Root/header.html');

            test(['header.html', {
                root: '/Root',
                extname: '.art',
                filename: '/Root/base/index.html'
            }], '/Root/header.html');

            test(['header.html', {
                root: '/Root',
                extname: '.art',
                filename: '/Web/base/index.html'
            }], '/Root/header.html');

            test(['./header.html', {
                root: '/'
            }], '/header.html');

            test(['./header.html', {
                root: '/Root'
            }], '/Root/header.html');

            test(['./header.html', {
                root: '/Root',
                extname: '.art',
                filename: '/Root/base/index.html'
            }], '/Root/base/header.html');

            test(['./header.html', {
                root: '/Root',
                extname: '.art',
                filename: '/Web/base/index.html'
            }], '/Web/base/header.html');

            test(['../../header.html', {
                root: '/'
            }], '/header.html');

            test(['../../header.html', {
                root: '/Root'
            }], '/header.html');

            test(['../../header.html', {
                root: '/Root',
                extname: '.art',
                filename: '/Root/base/index.html'
            }], '/header.html');

            test(['../../header.html', {
                root: '/Root',
                extname: '.art',
                filename: '/Web/base/index.html'
            }], '/header.html');

            test(['/header.html', {
                root: '/'
            }], '/header.html');

            test(['/header.html', {
                root: '/Root'
            }], '/header.html');

            test(['/header.html', {
                root: '/Root',
                extname: '.art',
                filename: '/Root/base/index.html'
            }], '/header.html');
            
            test(['/header.html', {
                root: '/Root',
                extname: '.art',
                filename: '/Web/base/index.html'
            }], '/header.html');
        }
    }
};