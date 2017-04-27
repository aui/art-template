var template = require('./lib/template-node');
var extension = require('./lib/extension');

template.extension = extension;
require.extensions[template.defaults.extname] = extension;

module.exports = template;