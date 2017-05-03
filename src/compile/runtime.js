const detectNode = require('detect-node');
const each = require('./adapter/each');
const escape = require('./adapter/escape');
const runtime = Object.create(detectNode ? global : window);

runtime.$each = each;
runtime.$escape = escape;

module.exports = runtime;