const template = require('./template');
const bindSyntax = require('./bind-syntax');
const bindExtname = require('./bind-extname');

template.bindExtname = bindExtname;
template.bindSyntax = bindSyntax;

module.exports = template;