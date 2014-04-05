/*!
 * artTemplate[NodeJS]
 * https://github.com/aui/artTemplate
 * Released under the MIT, BSD, and GPL Licenses
 */

var fs = require('fs');
var path = require('path');
var template = require('./template.js');


// 提供新的配置字段
template.defaults.path = '';
template.defaults.extname = '.html';
template.defaults.encoding = 'utf-8';


// 重写加载模板源文件方法
template.readTemplate = function (id) {
    id = path.join(template.defaults.path, id + template.defaults.extname);
    
    if (id.indexOf(template.defaults.path) !== 0) {
        // 安全限制：禁止超出模板目录之外调用文件
        throw new Error('"' + id + '" is not in the template directory');
    } else {
        try {
            return fs.readFileSync(id, template.defaults.encoding);
        } catch (e) {}
    }
}


// 重写`include``的实现方法，转换模板为绝对路径
template.helpers.$include = function (id, data, from) {
    
    from = path.dirname(from);
    id = path.join(from, id);
    
    return template.renderFile(id, data);
}


// express support
template.__express = function (path, options, fn) {

    if (typeof options === 'function') {
        fn = options;
        options = {};
    }

    options.filename = path;
    fn(null, template.renderFile(path, options));
};


module.exports = template;