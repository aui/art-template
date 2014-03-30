/*!
 * artTemplate[NodeJS]
 * https://github.com/aui/artTemplate
 * Released under the MIT, BSD, and GPL Licenses
 */
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var template = require('../src/node-template.js');
var syntaxPath = path.join(__dirname, '../src/template-syntax.js');
var syntaxEncoding = 'utf-8';

// template-syntax 暂时没有使用标准模块，采用 vm.runInNewContext 方式
var syntaxCode = fs.readFileSync(syntaxPath, syntaxEncoding);
vm.runInNewContext(syntaxCode, {
    template: template
});

module.exports = template;