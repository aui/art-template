/*!
 * artTemplate[NodeJS]
 * https://github.com/aui/artTemplate
 * Released under the MIT, BSD, and GPL Licenses
 */

var fs = require('fs');
var path = require('path');
var template = require('../src/template.js');


// 提供新的配置字段
template.path = __dirname;
template.extname = '.html';
template.encoding = 'utf-8';


// 重写加载模板源文件方法
template.loadTemplate = function (id) {
    id = path.join(template.path, id + template.extname);

    try {
        return fs.readFileSync(id, template.encoding);
    } catch (e) {
    	
    }
}


// 重写`include``的实现方法，转换模板为绝对路径
template.helpers.$include = function (id, data, from) {
    
    from = path.dirname(from);
    id = path.join(from, id);
    
    return template.render(id, data);
}


module.exports = template;