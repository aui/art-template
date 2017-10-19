const path = require('path');
const template = require('../../../src');
const data = {
    title: 'My Page'
};
const html = template(path.resolve(__dirname, 'index.art'), data);
console.log(html);