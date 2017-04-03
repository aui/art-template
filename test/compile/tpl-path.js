const assert = require('assert');
const tplPath = require('../../src/compile/tpl-path');

describe('#compile/tpl-path', () => {

    const test = (args, result) => {
        it(JSON.stringify(args), () => {
            assert.deepEqual(result, tplPath(...args));
        });
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

    // describe('browser', () => {
    //     global.document = {};
    //     test(['tpl-header', '/', 'tpl-index'], 'tpl-header');
    //     delete global.document;
    // });

});