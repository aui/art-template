const render = require('./render');
const compile = require('./compile');
const bindExtname = require('./bind-extname');
const defaults = require('./compile/defaults');
const renderFile = require('./template');

/**
 * @param   {string}            filename
 * @param   {Object|string}     content
 * @return  {string|function}
 */
const template = renderFile;
template.render = render;
template.compile = compile;
template.defaults = defaults;
template.bindExtname = bindExtname;

module.exports = template;