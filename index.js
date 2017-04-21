var template = require('./lib/template-node');
var extension = require('./lib/extension');
var precompile = require('./lib/precompile');

template.extension = extension;
template.precompile = precompile;
require.extensions[template.defaults.extname] = extension;

module.exports = template;