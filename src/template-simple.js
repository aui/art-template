const template = require('./template-native');
const syntax = require('./syntax');
syntax(template.defaults);
module.exports = template;