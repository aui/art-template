const path = require('path');
const template = require('../../src');
const data = {
    parent: '<style>#example{}</style>'
};
const html = template(path.resolve(__dirname, 'index.art'), data);
console.log(html);