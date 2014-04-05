var fs = require('fs');
var path = require('path');

module.exports = function (template) {

	var cacheStore = template.cache;


	// 提供新的配置字段
	template.defaults.path = '';
	template.defaults.extname = '.html';
	template.defaults.encoding = 'utf-8';


	// 重写引擎编译结果获取方法
	template.get = function (filename) {
		
	    var fn;
	    
	    if (cacheStore.hasOwnProperty(filename)) {
	        // 使用内存缓存
	        fn = cacheStore[filename];
	    } else {
	        // 加载模板并编译
	        var source = readTemplate(filename);
	        if (typeof source === 'string') {
	            fn = template.compile(source, {
	                filename: filename
	            });
	        }
	    }

	    return fn;
	};

	
	function readTemplate (id) {
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


	// 重写模板`include``语句实现方法，转换模板为绝对路径
	template.helpers.$include = function (filename, data, from) {
	    
	    from = path.dirname(from);
	    filename = path.join(from, filename);
	    
	    return template.renderFile(filename, data);
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


	return template;
}