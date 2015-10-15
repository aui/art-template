var fs = require('fs');
var path = require('path');

module.exports = function (template) {

	var cacheStore = template.cache;
	var defaults = template.defaults;
	var rExtname;

	// 提供新的配置字段
	defaults.base = '';
	defaults.extname = '.html';
	defaults.encoding = 'utf-8';

	function compileFromFS(filename) {
		// 加载模板并编译
		var source = readTemplate(filename);

		if (typeof source === 'string') {
			return template.compile(source, {
				filename: filename
			});
		}
	}

	// 重写引擎编译结果获取方法
	template.get = function (filename) {
		
	    var fn;


	    if (cacheStore.hasOwnProperty(filename)) {
	        // 使用内存缓存
	        fn = cacheStore[filename];
	    } else {
			fn = compileFromFS(filename);

		    if (fn) {
			    var watcher = fs.watch(filename + defaults.extname);

			    // 文件发生改变，重新生成缓存
			    // TODO： 观察删除文件，或者其他使文件发生变化的改动
			    watcher.on('change', function (event) {
				    if (event === 'change') {
					    cacheStore[filename] = compileFromFS(filename);
				    }
			    });
		    }
	    }

	    return fn;
	};

	
	function readTemplate (id) {
	    id = path.join(defaults.base, id + defaults.extname);
	    
	    if (id.indexOf(defaults.base) !== 0) {
	        // 安全限制：禁止超出模板目录之外调用文件
	        throw new Error('"' + id + '" is not in the template directory');
	    } else {
	        try {
	            return fs.readFileSync(id, defaults.encoding);
	        } catch (e) {}
	    }
	}


	// 重写模板`include``语句实现方法，转换模板为绝对路径
	template.utils.$include = function (filename, data, from) {
	    
	    from = path.dirname(from);
	    filename = path.join(from, filename);
	    
	    return template.renderFile(filename, data);
	}


	// express support
	template.__express = function (file, options, fn) {

	    if (typeof options === 'function') {
	        fn = options;
	        options = {};
	    }


		if (!rExtname) {
			// 去掉 express 传入的路径
			rExtname = new RegExp((defaults.extname + '$').replace(/\./g, '\\.'));
		}


	    file = file.replace(rExtname, '');

	    options.filename = file;
	    fn(null, template.renderFile(file, options));
	};


	return template;
}