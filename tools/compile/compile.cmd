@if (0===0) @end/*
:: ----------------------------------------------------------
:: artTemplate - Compile Tools v1.0 beta4
:: https://github.com/aui/artTemplate
:: Released under the MIT, BSD, and GPL Licenses
:: Email: 1987.tangbin@gmail.com
:: ----------------------------------------------------------

@echo off
title loading..
cd %~dp0
call CScript.EXE "%~dpnx0" //Nologo //e:jscript %*
title Compile Tools
goto cmd
*/

// 模板引擎路径
var template = require('../../template.js');

// 模板引擎自定义语法支持。如果不使用语法插件请注释此行
// require('../../extensions/template-syntax.js');

// js格式化工具路径
var js_beautify = require('./lib/beautify.js');

// 设置待处理的模版编码
var $charset = 'UTF-8';

// 设置前端模板目录路径
var $path = './demo/templates/';

// 设置辅助方法编译方式：
// 为true则克隆到每个编译后的文件中，为false则单独输出到文件
var $cloneHelpers = false;


// 操作系统相关API封装
var OS = {
	
	file: {
	
		/** 
		 * 文件读取
		 * @param	{String}		文件路径
		 * @param	{String}		指定字符集
		 * @param 	{Boolean} 		是否为二进制数据. 默认false
		 * @return	{String} 	    文件内容
		 */
		read: function (path, charset, isBinary) {
			charset = charset || 'UTF-8';
			var stream = new ActiveXObject('adodb.stream');
			var fileContent;

			stream.type = isBinary ? 1 : 2;
			stream.mode = 3;
			stream.open();
			stream.charset = charset;
			try {
				stream.loadFromFile(path);
			} catch (e) {
				OS.console.log(path);
				throw e;
			}
			fileContent = new String(stream.readText());
			fileContent.charset = charset;
			stream.close();
			return fileContent.toString();
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
			var stream = new ActiveXObject('adodb.stream');
			
			stream.type = isBinary ? 1 : 2;

			if (charset) {
				stream.charset = charset;
			} else if (!isBinary) {
				stream.charset = 'UTF-8';
			}
			
			try {
				stream.open();
				if (!isBinary) {
					stream.writeText(data);
				} else {
					stream.write(data);
				}
				stream.saveToFile(path, 2);

				return true;
			} catch (e) {
				throw e;
			} finally {
				stream.close();
			}

			return true;
		},

		
		/**
		 * 枚举目录中所有文件名(包括子目录文件)
		 * @param	{String}	目录
		 * @return	{Array}		文件列表
		 */
		get: (function (path) {
			var fso = new ActiveXObject('Scripting.FileSystemObject');
			var listall = function (infd) {
			
				var fd = fso.GetFolder(infd + '\\');
				var fe = new Enumerator(fd.files);
				var list = [];
				
				while(!fe.atEnd()) { 
					list.push(fe.item() + '');
					fe.moveNext();
				}
				
				var fk = new Enumerator(fd.SubFolders);
				for (; !fk.atEnd(); fk.moveNext()) {
					list = list.concat(listall(fk.item()));
				}
				
				return list;
			};
			
			return function (path) {
				var list = [];
				try {
					list = listall(path);
				} catch (e) {
				}
				return list;
			}
		})()
	},
	
	app: {


        /**
         * 获取完整路径名
         * @return  {String}
         */
        getFullName: function () {
          return WScript.ScriptFullName
        },
	
		/**
		 * 获取运行参数
		 * @return	{Array}			参数列表
		 */
		getArguments: function () {
			var Arguments = WScript.Arguments;
			var length = Arguments.length;
			var args = [];
			
			if (length) {
				for (var i = 0; i < length; i ++) {
					args.push(Arguments(i));
				}
			}
			
			return args;
		},
		
		quit: function () {
			WScript.Quit(OS.app.errorlevel);
		},
		
		errorlevel: 0
	},
	
	// 控制台
	console: {
		error: function (message) {
			OS.app.errorlevel = 1;
			WScript.Echo(message);
		},
		log: function (message) {
			WScript.Echo(message);
		}
	}
};

var Global = this;
var console = OS.console;
var log = console.log;
var error = console.error;

function require (path) {
	this.$dependencies = this.$dependencies || [];
	this.$dependencies.push(path);
}

this.$dependencies = this.$dependencies || [];
for (var i = 0; i < this.$dependencies.length; i ++) {
	Global.eval(OS.file.read(this.$dependencies[i], 'UTF-8'));
}


/*-----*/


if (!Array.prototype.forEach) {
  // ES5 15.4.4.18
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/foreach
  Array.prototype.forEach = function(fn, context) {
    for (var i = 0, len = this.length >>> 0; i < len; i++) {
      if (i in this) {
        fn.call(context, this[i], i, this);
      }
    }
  }; 
}

if (!String.prototype.trim) {
String.prototype.trim = (function() {

    // http://perfectionkills.com/whitespace-deviations/
    var whiteSpaces = [

      '\\s',
      '00A0', // 'NO-BREAK SPACE'
      '1680', // 'OGHAM SPACE MARK'
      '180E', // 'MONGOLIAN VOWEL SEPARATOR'
      '2000-\\u200A',
      '200B', // 'ZERO WIDTH SPACE (category Cf)
      '2028', // 'LINE SEPARATOR'
      '2029', // 'PARAGRAPH SEPARATOR'
      '202F', // 'NARROW NO-BREAK SPACE'
      '205F', // 'MEDIUM MATHEMATICAL SPACE'
      '3000' //  'IDEOGRAPHIC SPACE'

    ].join('\\u');

    var trimLeftReg = new RegExp('^[' + whiteSpaces + ']+');
    var trimRightReg = new RegExp('[' + whiteSpaces + ']+$');

    return function() {
      return String(this).replace(trimLeftReg, '').replace(trimRightReg, '');
    }

  })();
}



/*!
 * 模板编译器核心程序
 * @see     https://github.com/aui/artTemplate
 * @param   {String}    模板
 * @param   {String}    外部辅助方法（可选参数，可在此指定外部辅助方法模块名称）
 * @return  {String}    编译好的模板
 */
var compileTemplate = (function () {

template.isCompress = true;

// 包装成RequireJS、SeaJS模块
var toModule = function (code, includeHelpers) {

    template.onerror = function (e) {
        throw e;
    };

    var render = template.compile(code);
    var prototype = render.prototype;

    render = render.toString()
    .replace(/^function\s+(anonymous)/, 'function');



    // 提取include模板
    // @see https://github.com/seajs/seajs/blob/master/src/util-deps.js
    var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*include|(?:^|[^$])\binclude\s*\(\s*(["'])(.+?)\1\s*(,\s*(.+?)\s*)?\)/g; //"
    var SLASH_RE = /\\\\/g

    function parseDependencies(code) {
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

    var dependencies = [];
    parseDependencies(render).forEach(function (id) {
        dependencies.push('\'' + id + '\': ' + 'require(\'' + id + '\')');
    });
    var isDependencies = dependencies.length;
    dependencies = '{' + dependencies.join(',') + '}';


    // 输出辅助方法
    var helpers;

    if (includeHelpers) {
    	includeHelpers = includeHelpers.replace(/\.js$/, '');
        helpers = 'require(\'' + includeHelpers + '\')';
    } else {
        helpers = [];
        for (var name in prototype) {
            if (name !== '$render') {
                helpers.push('\'' + name + '\': ' + prototype[name].toString());
            }
        }
        helpers = '{' + helpers.join(',') + '}';
    }


    code = 'define(function (require) {\n'
         +      (isDependencies ? 'var dependencies = ' + dependencies + ';' : '')
         +      'var helpers = ' + helpers + ';\n'
         +      (isDependencies ? 'var $render = function (id, data) {'
         +          'return dependencies[id](data);'
         +      '};' : '')
         +      'var Render = ' + render  + ';\n'
         +      'Render.prototype = helpers;'
         +      'return function (data) {\n'
         +          (isDependencies ? 'helpers.$render = $render;' : '')
         +          'return new Render(data) + \'\';'
         +      '};\n'
         + '});';
    
    
    return code;
};


// 格式化js
var beautify = function (code) {
    
    if (typeof js_beautify !== 'undefined') {
        var config = {
            indent_size: 4,
            indent_char: ' ',
            preserve_newlines: true,
            braces_on_own_line: false,
            keep_array_indentation: false,
            space_after_anon_function: true
        };
        code = js_beautify(code, config);
    }
    return code;
};


return function (source, includeHelpers) {
    var amd = toModule(source, includeHelpers);
    return beautify(amd);
}

})();


// Canonicalize a path
// realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"
function realpath (path) {
  var DOT_RE = /\/\.\//g
  var MULTIPLE_SLASH_RE = /([^:\/])\/\/+/g
  var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//g

  path = path.replace(DOT_RE, "/")

  path = path.replace(MULTIPLE_SLASH_RE, "$1\/")

  while (path.match(DOUBLE_DOT_RE)) {
    path = path.replace(DOUBLE_DOT_RE, "/")
  }

  return path
}

// 相对路径转换为绝对路径
if (/^\./.test($path)) {
  $path = realpath((OS.app.getFullName().replace(/[^\/\\]*?$/, '') + $path).replace(/\\/g, '/'));
}

log('配置信息：');
log('$charset = ' + $charset);
log('$cloneHelpers = ' + $cloneHelpers);
log('$path = ' + $path);
log('-----------------------');


var args = OS.app.getArguments(); // 获取使用拖拽方式打开的文件列表
var list = args.length ? args : OS.file.get($path); // 待处理的文件列表



list.forEach(function (path, index) {
    // 把路径 "\" 转换成 "/"
    path = list[index] = path.replace(/\\/g, '/');
    
    // 合法性校验
    if (path.indexOf($path) !== 0) {
        error('警告：' + path + '不在模板目录中，可能导致路径错误');
    }
});




// 把辅助方法输出为独立的文件
if (!$cloneHelpers) {
    var helpers = [];
    var helpersName = '$helpers.js';
    var path = $path + helpersName;
    for (var name in template.prototype) {
        if (name !== '$render') {
            helpers.push('\'' + name + '\': ' + template.prototype[name].toString());
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
        module = js_beautify(module, config);
    }

	
	OS.file.write(path, module, $charset);
}




// 编译所有模板
list.forEach(function (path) {
	var rname = /\.(html|htm)$/i;
	if (!rname.test(path)) {
		return;
	}

    var name = helpersName;
    
    // 计算辅助方法模块的相对路径
    if (name) {
        var prefix = './';
        var length = path.replace($path, '').replace(/[^\/]/g, '').length;

        if (length) {
          prefix = (new Array(length + 1)).join('../');
        }

        name = prefix + name;
    }

	log('编译: ' + path);

	var source = OS.file.read(path, $charset);
	var code = compileTemplate(source, name);
	var target = path.replace(rname, '.js');

	OS.file.write(target, code, $charset);

	log('输出: ' + target);
});

log('-----------------------');
log('编译结束');

OS.app.quit();

/*-----------------------------------------------*//*
:cmd
::if %errorlevel% == 0 exit
pause>nul
exit
*/





