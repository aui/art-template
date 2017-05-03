'use strict';

var detectNode = require('detect-node');
var each = require('./adapter/each');
var escape = require('./adapter/escape');
var runtime = Object.create(detectNode ? global : window);

runtime.$each = each;
runtime.$escape = escape;

module.exports = runtime;