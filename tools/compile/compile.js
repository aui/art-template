/*!
:: ----------------------------------------------------------
:: artTemplate - Compile Tools[NodeJS] v1.0
:: https://github.com/aui/artTemplate
:: Released under the MIT, BSD, and GPL Licenses
:: ----------------------------------------------------------
*/

// 设置前端模板目录路径
var $path = './demo/templates/';

// 设置待处理的模版编码
var $charset = 'UTF-8';

// 设置辅助方法编译方式：
// 为true则克隆到每个编译后的文件中，为false则单独输出到文件
var $cloneHelpers = false;

// 模板引擎路径
var template = require('../../template.js');

// 模板简单语法支持。不使用请注释此行
// require('../../extensions/template-syntax.js');

// js格式化工具路径
var js_beautify = require('./lib/beautify.js');




var path = require('path');
var fs = require('fs');


// 操作系统相关API封装
var OS = {

	path: {
		dirname: path.dirname,
		join: path.join,
		relative: path.relative
	},
	
	file: {
	
		/** 
		 * 文件读取
		 * @param	{String}		文件路径
		 * @param	{String}		指定字符集
		 * @param 	{Boolean} 		是否为二进制数据. 默认false
		 * @return	{String} 	    文件内容
		 */
		read: function (path, charset, isBinary) {

			var encoding;

		 	if (!isBinary) {
		 		encoding = charset.toLowerCase();
		 	}

			return fs.readFileSync(path, encoding);
		},


		/**
		 * 文件写入
		 * @param 	{String} 		文件路径
		 * @param 	{String} 		要写入的数据
		 * @param	{String}		指定字符集. 默认'UTF-8'
		 * @param 	{Boolean} 		是否为二进制数据. 默认false
		 * @return 	{Boolean} 		操作是否成功
		 */
		 write: function (path, data, charset, isBinary) {

		 	var encoding;

		 	if(!isBinary){
		 		encoding = charset.toLowerCase();
		 	}

			return fs.writeFileSync(path,data,encoding);
		},

		
		/**
		 * 枚举目录中所有文件名(包括子目录文件)
		 * @param	{String}	目录
		 * @return	{Array}		文件列表
		 */
		get: (function () {

			var readFolder = function (folder) {

				var ret = [],
					folderContent = fs.readdirSync(folder);

				folderContent.forEach(function(folderItem){

					var fullPath = path.join(folder,folderItem);

					if(/^\./.test(folderItem)) return [];

					var isDirectory = fs.statSync(fullPath).isDirectory();

					if(isDirectory){

						ret = ret.concat(readFolder(fullPath));

					}else{

						ret.push(fullPath);

					}

				});

				return ret;
			};
			
			return function (folder) {
				var list = readFolder(folder);
				return list;
			};
		})()
	},
	
	app: {

	
		/**
		 * 获取运行参数
		 * @return	{Array}			参数列表
		 */
		getArguments: function () {

			var length = process.argv.length - 2;
			var args = [];

			if (length) {
				for (var i = 0; i<length; i++) {
					args.push(process.argv[i+2]);
				}
			}
			
			return args;
		}

	}
	
};

var Global = this;
var log = console.log;
var error = console.error;



/*!
 * 模板编译器
 * @param   {String}    模板
 * @param   {String}    外部辅助方法路径（若不定义则会把辅助方法复制后编译到函数内）
 * @return  {String}    编译好的模板
 */
var compiler = (function () {

	template.isCompress = true;


    // 提取include模板
    // @see https://github.com/seajs/seajs/blob/master/src/util-deps.js
    var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*include|(?:^|[^$])\binclude\s*\(\s*(["'])(.+?)\1\s*(,\s*(.+?)\s*)?\)/g; //"
    var SLASH_RE = /\\\\/g

    var parseDependencies = function (code) {
      var ret = [];
	  var uniq = {};

      code.replace(SLASH_RE, "")
          .replace(REQUIRE_RE, function(m, m1, m2) {
            if (m2 && !uniq.hasOwnProperty(m2)) {
              ret.push(m2);
			  uniq[m2] = true;
            }
          })

      return ret
    };


	// 包装成RequireJS、SeaJS模块
	var toModule = function (code, helpersPath) {

	    template.onerror = function (e) {
	        throw e;
	    };

	    var render = template.compile(code); // 使用artTemplate编译模板
	    

	    render = render.toString()
	    .replace(/^function\s+(anonymous)/, 'function');


	    // SeaJS与RequireJS规范，相对路径前面需要带“.”
	    var fixPath = function (path) {
	    	path = path
	    	.replace(/\\/g, '/')
	    	.replace(/\.js$/, '');

			if (!/^(\.)*?\//.test(path)) {
				path = './' + path;
			}
			return path;
	    };


	    var dependencies = [];
	    parseDependencies(render).forEach(function (path) {
	        dependencies.push(
	        	'\'' + path + '\': ' + 'require(\'' + fixPath(path) + '\')'
	        );
	    });
	    var isDependencies = dependencies.length;
	    dependencies = '{' + dependencies.join(',') + '}';


	    // 输出辅助方法
	    var helpers;

	    if (helpersPath) {

	    	helpersPath = fixPath(helpersPath);

	        helpers = 'require(\'' + helpersPath + '\')';

	    } else {

	        helpers = [];
	        var prototype = render.prototype;

	        for (var name in prototype) {
	            if (name !== '$render') {
	                helpers.push(
	                	'\'' + name + '\': ' + prototype[name].toString()
	                );
	            }
	        }
	        helpers = '{' + helpers.join(',') + '}';
	    }


	    code =
	    'define(function(require) {'
        +      (isDependencies ? 'var dependencies=' + dependencies + ';' : '')
        +      'var helpers = ' + helpers + ';'
        +      (isDependencies ? 'var $render=function(id,data){'
        +          'return dependencies[id](data);'
        +      '};' : '')
        +      'var Render=' + render  + ';'
        +      'Render.prototype=helpers;'
        +      'return function(data){'
        +          (isDependencies ? 'helpers.$render=$render;' : '')
        +          'return new Render(data) + \'\';'
        +      '}'
        + '});';
	    
	    
	    return code;
	};


	// 外部JS格式化工具
	var format = function (code) {
			
		if (typeof js_beautify !== 'undefined') {
			var config = {
				indent_size: 4,
				indent_char: ' ',
				preserve_newlines: true,
				braces_on_own_line: false,
				keep_array_indentation: false,
				space_after_anon_function: true
			};
			code = typeof js_beautify === 'function'
			? js_beautify(code, config)
			: js_beautify.js_beautify(code, config);
		}
		return code;
	};


	return function (source, helpersPath) {
	    var code = toModule(source, helpersPath);
	    return format(code);
	}

})();





log('$path = ' + $path);
log('-----------------------');



// 如果输出目录不存在，则新建
(function(){

	var currPath = $path,
		toMakeUpPath = [];

	while(!fs.existsSync(currPath)){

		toMakeUpPath.unshift(currPath);
		currPath = path.dirname(currPath);

	}

	toMakeUpPath.forEach(function(pathItem){

		fs.mkdirSync(pathItem);

	})

})();



// 把辅助方法输出为独立的文件
var writeHelpers = function () {

	if ($cloneHelpers) {
		return;
	}

	var helpersName = '$helpers.js';

    var helpers = [];
    var path = $path + helpersName;
    var prototype = template.prototype;

    for (var name in prototype) {
        if (name !== '$render') {
            helpers.push('\'' + name + '\': ' + prototype[name].toString());
        }
    }
    helpers = '{\r\n' + helpers.join(',\r\n') + '}';

    var module = 'define(function () {'
    +	'return ' + helpers
	+ '});'

    if (typeof js_beautify !== 'undefined') {
        var config = {
            indent_size: 4,
            indent_char: ' ',
            preserve_newlines: true,
            braces_on_own_line: false,
            keep_array_indentation: false,
            space_after_anon_function: true
        };
		module = typeof js_beautify === 'function'
		? js_beautify(module, config)
		: js_beautify.js_beautify(module, config);
    }


	OS.file.write(path, module, $charset);

	return helpersName;
};



var helpersName = writeHelpers();
var args = OS.app.getArguments(); // 获取使用拖拽方式打开的文件列表
var list = args.length ? args : OS.file.get($path); // 待处理的文件列表


// 编译队列中的模板
list.forEach(function (file) {
	var rname = /\.(html|htm)$/i;
	if (!rname.test(file)) {
		return;
	}

	var name = helpersName;

	// 计算辅助方法模块的相对路径
	if (helpersName) {
		var dirname = OS.path.dirname(file);
		var join = OS.path.join($path, name);
		name = OS.path.relative(dirname, join);
	}


	log('编译: ' + file);

	var source = OS.file.read(file, $charset);
	var code = compiler(source, name);
	var target = file.replace(rname, '.js');

	OS.file.write(target, code, $charset);

	log('输出: ' + target);
});


log('-----------------------');
log('结束');
