/*! art-template@4.0.0 | https://github.com/aui/art-template */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["template"] = factory();
	else
		root["template"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 26);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var debug = __webpack_require__(11);
var imports = __webpack_require__(12);
var cache = __webpack_require__(10);

/**
 * 默认配置
 */
var defaults = {
    // 模板名字
    filename: null,
    // 模板内容
    source: null,
    // 逻辑语法开始标签
    openTag: '<%',
    // 逻辑语法结束标签
    closeTag: '%>',
    // 编码输出操作符（只支持一个字符）
    escapeSymbol: '=',
    // 原始输出操作符（只支持一个字符）
    rawSymbol: '-',
    // 是否编码输出语句
    escape: true,
    // 缓存（依赖 filename 字段）
    cache: cache,
    // 模板逻辑表达式解析器
    parseExpression: null,
    // HTML 语句解析器
    parseString: null,
    // 导入的模板变量
    imports: imports,
    // 调试处理函数
    debug: debug,
    // 是否编译调试版
    compileDebug: false,
    // bail 如果为 true，编译错误与运行时错误都会抛出异常
    bail: false,
    // 模板根目录（Node）
    root: '/',
    // 模板扩展名（Node, 只读）
    extname: '.html'
};

module.exports = defaults;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Compiler = __webpack_require__(13);
var defaults = __webpack_require__(0);
var getOptions = __webpack_require__(14);
var tplLoader = __webpack_require__(16);
var tplPath = __webpack_require__(6);

/**
 * 编译模版
 * @param {string|Object} source   模板内容
 * @param {?Object}       options  编译选项
 * @returns {function}
 */
var compile = function compile(source) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


    if ((typeof source === 'undefined' ? 'undefined' : _typeof(source)) === 'object') {
        options = source;
    } else {
        options.source = source;
    }

    // 匹配缓存
    var filename = options.filename;
    var cache = options.cache !== undefined ? options.cache : defaults.cache;
    if (cache && filename) {
        var _render = cache.get(filename);
        if (_render) {
            return _render;
        }
    }

    // 合并默认配置
    options = getOptions(options, defaults);
    source = options.source;

    var debug = options.debug;

    // 加载外部模板
    if (!source) {
        try {
            var target = tplPath(filename, options.root);
            source = tplLoader(target);
            options.filename = target;
            options.source = source;
        } catch (e) {

            var error = {
                path: filename,
                name: 'Compile Error',
                message: 'template not found: ' + e.message,
                stack: e.stack
            };

            if (options.bail) {
                debug(error)();
                throw error;
            } else {
                return debug(error);
            }
        }
    }

    var compiler = new Compiler(options);

    var render = function render(data) {

        try {
            return render.source(data);
        } catch (e) {

            // 运行时出错以调试模式重载
            if (!options.compileDebug) {
                options.cache = null;
                options.compileDebug = true;
                return compile(options)(data);
            }

            if (options.bail) {
                debug(e)();
                throw e;
            } else {
                return debug(e)();
            }
        }
    };

    try {
        render.source = compiler.build();

        // 缓存编译成功的模板
        if (cache && filename) {
            cache.set(filename, render);
        }
    } catch (e) {
        if (options.bail) {
            debug(e)();
            throw e;
        } else {
            return debug(e);
        }
    }

    render.toString = function () {
        return render.source.toString();
    };

    return render;
};

module.exports = compile;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

module.exports = false;

// Only Node.JS has a process variable that is of [[Class]] process
try {
  module.exports = Object.prototype.toString.call(global.process) === '[object process]';
} catch (e) {}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Copyright 2014, 2015, 2016, 2017 Simon Lydell
// License: MIT. (See LICENSE.)

Object.defineProperty(exports, "__esModule", {
    value: true
});

// This regex comes from regex.coffee, and is inserted here by generate-index.js
// (run `npm run build`).
exports.default = /((['"])(?:(?!\2|\\).|\\(?:\r\n|[\s\S]))*(\2)?|`(?:[^`\\$]|\\[\s\S]|\$(?!\{)|\$\{(?:[^{}]|\{[^}]*\}?)*\}?)*(`)?)|(\/\/.*)|(\/\*(?:[^*]|\*(?!\/))*(\*\/)?)|(\/(?!\*)(?:\[(?:(?![\]\\]).|\\.)*\]|(?![\/\]\\]).|\\.)+\/(?:(?!\s*(?:\b|[\u0080-\uFFFF$\\'"~({]|[+\-!](?!=)|\.?\d))|[gmiyu]{1,5}\b(?![\u0080-\uFFFF$\\]|\s*(?:[+\-*%&|^<>!=?({]|\/(?![\/*])))))|(0[xX][\da-fA-F]+|0[oO][0-7]+|0[bB][01]+|(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?)|((?!\d)(?:(?!\s)[$\w\u0080-\uFFFF]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+)|(--|\+\+|&&|\|\||=>|\.{3}|(?:[+\-\/%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2})=?|[?~.,:;[\](){}])|(\s+)|(^$|[\s\S])/g;

exports.matchToToken = function (match) {
    var token = { type: "invalid", value: match[0] };
    if (match[1]) token.type = "string", token.closed = !!(match[3] || match[4]);else if (match[5]) token.type = "comment";else if (match[6]) token.type = "comment", token.closed = !!match[7];else if (match[8]) token.type = "regex";else if (match[9]) token.type = "number";else if (match[10]) token.type = "name";else if (match[11]) token.type = "punctuator";else if (match[12]) token.type = "whitespace";
    return token;
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// List extracted from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#Keywords

var reservedKeywords = {
    'abstract': true,
    'await': true,
    'boolean': true,
    'break': true,
    'byte': true,
    'case': true,
    'catch': true,
    'char': true,
    'class': true,
    'const': true,
    'continue': true,
    'debugger': true,
    'default': true,
    'delete': true,
    'do': true,
    'double': true,
    'else': true,
    'enum': true,
    'export': true,
    'extends': true,
    'false': true,
    'final': true,
    'finally': true,
    'float': true,
    'for': true,
    'function': true,
    'goto': true,
    'if': true,
    'implements': true,
    'import': true,
    'in': true,
    'instanceof': true,
    'int': true,
    'interface': true,
    'let': true,
    'long': true,
    'native': true,
    'new': true,
    'null': true,
    'package': true,
    'private': true,
    'protected': true,
    'public': true,
    'return': true,
    'short': true,
    'static': true,
    'super': true,
    'switch': true,
    'synchronized': true,
    'this': true,
    'throw': true,
    'transient': true,
    'true': true,
    'try': true,
    'typeof': true,
    'var': true,
    'void': true,
    'volatile': true,
    'while': true,
    'with': true,
    'yield': true
};

module.exports = function (str) {
    return reservedKeywords.hasOwnProperty(str);
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var path = __webpack_require__(3);
var detectNode = __webpack_require__(2);

/**
 * 获取模板的绝对路径
 * @param   {string} filename 
 * @param   {string} root 
 * @param   {?string} base 
 * @returns {string}
 */
var tplPath = function tplPath(filename, root, base) {
    if (detectNode) {
        var dirname = base ? path.dirname(base) : '';
        return path.resolve(root, dirname, filename);
    } else {
        return filename;
    }
};

module.exports = tplPath;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var render = __webpack_require__(8);
var compile = __webpack_require__(1);
var defaults = __webpack_require__(0);

/**
 * 模板引擎
 * @param   {string}            filename 模板名
 * @param   {Object|string}     content  数据或模板内容
 * @return  {string|function}            如果 content 为 string 则编译并缓存模板，否则渲染模板
 */
var template = function template(filename, content) {
    return (typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object' ? render({
        filename: filename
    }, content) : compile({
        filename: filename,
        source: content
    });
};

template.render = render;
template.compile = compile;
template.defaults = defaults;

module.exports = template;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var compile = __webpack_require__(1);

/**
 * 渲染模板
 * @param   {string|Object}    source  模板内容
 * @param   {Object}    data    数据
 * @param   {?Object}   options 选项
 * @return  {string}            渲染好的字符串
 */
var render = function render(source, data, options) {
  return compile(source, options)(data);
};

module.exports = render;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var g;

// This works in non-strict mode
g = function () {
	return this;
}();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var cache = {
    __data: Object.create(null),

    set: function set(key, val) {
        this.__data[key] = val;
    },

    get: function get(key) {
        return this.__data[key];
    },

    reset: function reset() {
        this.__data = {};
    }
};

module.exports = cache;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * 调试器
 * @param   {Object} error 
 * @returns {string}
 */
var debug = function debug(error) {

    if ((typeof console === 'undefined' ? 'undefined' : _typeof(console)) === 'object') {
        console.error('Template Error:', JSON.stringify(error, null, 2));
    }

    return function () {
        return '{Template Error}';
    };
};

module.exports = debug;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * 导入到模板的全局变量
 */
var imports = {

    /**
     * 载入子模板
     * @param   {string}    filename
     * @param   {Object}    data
     * @param   {string}    base
     * @param   {string}    root
     * @returns {string}
     */
    $include: function $include(filename, data, base, root) {
        var compile = __webpack_require__(1);
        var tplPath = __webpack_require__(6);
        filename = tplPath(filename, root, base);
        return compile({
            filename: filename
        })(data);
    },

    /**
     * 编码模板输出的内容
     * @param   {Any}   content
     * @returns {string}
     */
    $escape: function $escape(content) {
        var escapeReg = /&(?![\w#]+;)|[<>"']/g;
        var escapeMap = {
            "<": "&#60;",
            ">": "&#62;",
            '"': "&#34;",
            "'": "&#39;",
            "&": "&#38;"
        };

        var toString = function toString(value) {
            if (typeof value !== 'string') {
                if (typeof value === 'function') {
                    value = toString(value.call(value));
                } else if (value === null) {
                    value = '';
                } else {
                    value = JSON.stringify(value) || '';
                }
            }

            return value;
        };

        return toString(content).replace(escapeReg, function (s) {
            return escapeMap[s];
        });
    }

};

module.exports = imports;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var jsTokens = __webpack_require__(15);
var tplTokens = __webpack_require__(17);
var isKeyword = __webpack_require__(5);

var DATA = '$data';
var IMPORTS = '$imports';
var has = function has(object, key) {
    return object.hasOwnProperty(key);
};
var stringify = JSON.stringify;

var Compiler = function () {
    function Compiler(options) {
        var _this = this;

        _classCallCheck(this, Compiler);

        var openTag = options.openTag;
        var closeTag = options.closeTag;
        var filename = options.filename;
        var root = options.root;
        var source = options.source;

        this.options = options;

        // 记录编译后生成的代码
        this.scripts = [];

        // 运行时注入的上下文
        this.context = {};

        // 内置变量
        this.internal = {
            $out: '""',
            $line: '[0,""]',
            print: 'function(){var text=\'\'.concat.apply(\'\',arguments);return $out+=text}',
            include: 'function(src,data){return $out+=$imports.$include(src,data||' + DATA + ',' + stringify(filename) + ',' + stringify(root) + ')}'
        };

        this.parseContext('$out');

        if (options.compileDebug) {
            this.parseContext('$line');
        }

        tplTokens.parser(source, openTag, closeTag).forEach(function (token) {
            var type = token.type;
            var value = token.value;
            var line = token.line;
            if (type === 'string') {
                _this.parseString(value, line);
            } else if (type === 'expression') {
                _this.parseExpression(value, line);
            }
        });
    }

    // 解析上下文


    _createClass(Compiler, [{
        key: 'parseContext',
        value: function parseContext(name) {

            var value = '';
            var internal = this.internal;
            var context = this.context;
            var options = this.options;
            var imports = options.imports;

            if (has(context, name) || name === DATA || name === IMPORTS || isKeyword(name)) {
                return;
            }

            if (has(internal, name)) {
                value = internal[name];
            } else if (has(imports, name)) {
                value = IMPORTS + '.' + name;
            } else {
                value = DATA + '.' + name;
            }

            context[name] = value;
        }

        // 解析字符串（HTML）直接输出语句

    }, {
        key: 'parseString',
        value: function parseString(source, line) {
            var options = this.options;
            var parseString = options.parseString;

            if (parseString) {
                source = parseString({ line: line, source: source, compiler: this });
            }

            var code = '$out+=' + stringify(source);
            this.scripts.push({ source: source, line: line, code: code });
        }

        // 解析逻辑表达式语句

    }, {
        key: 'parseExpression',
        value: function parseExpression(source, line) {
            var _this2 = this;

            var options = this.options;
            var openTag = options.openTag;
            var closeTag = options.closeTag;
            var parseExpression = options.parseExpression;
            var compileDebug = options.compileDebug;
            var escape = options.escape;
            var escapeSymbol = options.escapeSymbol;
            var rawSymbol = options.rawSymbol;
            var expression = source.replace(openTag, '').replace(closeTag, '');

            // ... v3 compat ...
            var code = expression.replace(/^=[=#]/, rawSymbol).replace(/^=/, escapeSymbol);
            // ... ejs compat ...
            code = code.replace(/^#/, '//').replace(/-$/, '');

            var tokens = jsTokens.trim(jsTokens.parser(code));

            // 将数据做为模板渲染函数的作用域
            jsTokens.namespaces(tokens).forEach(function (name) {
                return _this2.parseContext(name);
            });

            if (parseExpression) {

                // 外部语法转换函数
                code = parseExpression({ tokens: tokens, line: line, source: source, compiler: this });
            } else {

                var firstToken = tokens[0];
                var isRaw = firstToken && firstToken.value === rawSymbol;
                var isEscape = firstToken && firstToken.value === escapeSymbol;
                var isOutput = isRaw || isEscape;

                // 处理输出语句
                if (isOutput) {
                    tokens.shift();
                    code = jsTokens.toString(tokens);

                    if (escape === false || isRaw) {
                        code = '$out+=' + code;
                    } else {
                        code = '$out+=$escape(' + code + ')';
                        this.parseContext('$escape');
                    }
                }
            }

            if (compileDebug) {
                code = '$line=[' + line + ',' + stringify(source) + '];\n' + code;
            }

            this.scripts.push({ source: source, line: line, code: code });
        }

        // 检查逻辑表达式语法

    }, {
        key: 'checkExpression',
        value: function checkExpression(source) {

            // 没有闭合的块级模板语句规则
            var rules = [

            // <% } %>
            // <% }else{ %>
            // <% }else if(a){ %>
            [/^\s*}.*?{?\s*$/, ''],

            // <% list.forEach(function(a,b){ %>
            [/(^.*?\(\s*function\s*\(.*?\)\s*{\s*$)/, '$1})'],

            // <% list.forEach((a,b)=>{ %>
            [/(^.*?\(\s*.*=>\s*{\s*$)/, '$1})'],

            // <% if(a){ %>
            // <% for(var i in d){ %>
            [/(^.*?\(.*?\)\s*{\s*$)/, '$1}']];

            var index = 0;
            while (index < rules.length) {
                if (rules[index][0].test(source)) {
                    var _source;

                    source = (_source = source).replace.apply(_source, _toConsumableArray(rules[index]));
                    break;
                }
                index++;
            };

            try {
                new Function(source);
                return true;
            } catch (e) {
                return false;
            }
        }

        // 构建渲染函数

    }, {
        key: 'build',
        value: function build() {

            var options = this.options;
            var context = this.context;
            var scripts = this.scripts;
            var source = options.source;
            var filename = options.filename;
            var imports = options.imports;

            var useStrictCode = '"use strict"';
            var contextCode = 'var ' + Object.keys(context).map(function (name) {
                return name + '=' + context[name];
            }).join(',');
            var scriptsCode = scripts.map(function (script) {
                return script.code;
            }).join(';\n');
            var returnCode = 'return $out';

            var renderCode = [useStrictCode, contextCode, scriptsCode, returnCode].join(';\n');

            // 插入运行时调试语句
            if (options.compileDebug) {
                var throwCode = '{' + ['path:' + stringify(filename), 'name:"Runtime Error"', 'message:e.message', 'line:$line[0]', 'source:$line[1]', 'stack:e.stack'].join(',') + '}';
                renderCode = 'try{' + renderCode + '}catch(e){throw ' + throwCode + '}';
            }

            renderCode = 'function (' + DATA + ') {' + renderCode + '}';

            try {
                return new Function(IMPORTS, 'return ' + renderCode)(imports);
            } catch (e) {

                var index = 0;
                var line = 0;
                var source2 = source;

                while (index < scripts.length) {
                    if (!this.checkExpression(scripts[index].code)) {
                        source2 = scripts[index].source;
                        line = scripts[index].line;
                        break;
                    }
                    index++;
                };

                throw {
                    path: filename,
                    name: 'Compile Error',
                    message: e.message,
                    line: line,
                    source: source2,
                    script: renderCode,
                    stack: e.stack
                };
            }
        }
    }]);

    return Compiler;
}();

;

module.exports = Compiler;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * 获取合并了默认配置的选项（支持拷贝原型属性）
 * @param {Object} options 
 * @param {Object} defaults 
 * @returns {Object}
 */
var getOptions = function getOptions(options, defaults) {
    for (var name in defaults) {
        var copy = defaults[name];
        if (Array.isArray(copy)) {
            options[name] = getOptions([], copy);
        } else if (copy !== null && (typeof copy === 'undefined' ? 'undefined' : _typeof(copy)) === 'object') {
            options[name] = getOptions({}, copy);
        } else {
            options[name] = defaults[name];
        }
    }
    return options;
};

module.exports = getOptions;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var jsTokens = __webpack_require__(4).default;
var matchToToken = __webpack_require__(4).matchToToken;
var isKeyword = __webpack_require__(5);

/**
 * 将逻辑表达式解释为 Tokens
 * @param {string} code
 * @return {Object[]}
 */
var parser = function parser(code) {
    return code.match(jsTokens).map(function (value) {
        jsTokens.lastIndex = 0;
        return matchToToken(jsTokens.exec(value));
    }).map(function (token) {
        if (token.type === 'name' && isKeyword(token.value)) {
            token.type = 'keyword';
        }
        return token;
    });
};

/**
 * 获取命名空间
 * @param {Object[]} tokens
 * @return {string[]}
 */
var namespaces = function namespaces(tokens) {
    var ignore = false;
    return tokens.filter(function (token) {
        return token.type !== 'whitespace' && token.type !== 'comment';
    }).filter(function (token) {
        if (token.type === 'name' && !ignore) {
            return true;
        }

        ignore = token.type === 'punctuator' && token.value === '.';

        return false;
    }).map(function (tooken) {
        return tooken.value;
    });
};

// 根据索引删除列表中空白与注释 token
var trimByIndex = function trimByIndex(tokens, index) {
    var token = tokens[index];
    var isRemove = !!token && (token.type === 'whitespace' || token.type === 'comment');
    if (isRemove) {
        tokens.splice(index, 1);
    }

    return isRemove;
};

/**
 * 删除左边空白与注释
 * @param {Object[]} tokens 
 */
var trimLeft = function trimLeft(tokens) {
    var _ref;

    tokens = (_ref = []).concat.apply(_ref, _toConsumableArray(tokens));
    while (trimByIndex(tokens, 0)) {}
    return tokens;
};

/**
 * 删除右边空白与注释
 * @param {Object[]} tokens 
 */
var trimRight = function trimRight(tokens) {
    var _ref2;

    tokens = (_ref2 = []).concat.apply(_ref2, _toConsumableArray(tokens));
    while (trimByIndex(tokens, tokens.length - 1)) {}
    return tokens;
};

/**
 * 删除左右边空白与注释
 * @param {Object[]} tokens 
 */
var trim = function trim(tokens) {
    tokens = trimLeft(tokens);
    return trimRight(tokens);
};

/**
 * 将 tokens 还原为源代码
 * @param {Object[]} tokens 
 * @returns {string}
 */
var toString = function toString(tokens) {
    return tokens.map(function (token) {
        return token.value;
    }).join('');
};

module.exports = {
    parser: parser,
    namespaces: namespaces,
    trimLeft: trimLeft,
    trimRight: trimRight,
    trim: trim,
    toString: toString
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * 读取模板内容（同步方法）
 * @param   {string}    模板名
 * @param   {string}
 */
var detectNode = __webpack_require__(2);
var tplLoader = function tplLoader(filename) {
    if (detectNode) {
        var fs = __webpack_require__(3);
        return fs.readFileSync(filename, 'utf8');
    } else {
        var elem = document.getElementById(filename);
        return elem.value || elem.innerHTML;
    }
};

module.exports = tplLoader;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * 将模板转换为 Tokens
 * @param {string} source 
 * @param {string} openTag 
 * @param {string} closeTag
 * @return {Object[]}
 */
// todo column
var parser = function parser(source, openTag, closeTag) {

    var tokens = [];
    var line = 1;
    source.split(openTag).forEach(function (code) {

        // code: [string] || [expression, string]
        code = code.split(closeTag);

        if (code.length > 1) {
            var value = openTag + code.shift() + closeTag;

            tokens.push({
                type: 'expression',
                value: value,
                line: line
            });

            line += value.split(/\n/).length - 1;
        }

        if (code[0]) {
            var _value = code[0];

            tokens.push({
                type: 'string',
                value: _value,
                line: line
            });

            line += _value.split(/\n/).length - 1;
        }
    });

    return tokens;
};

module.exports = {
    parser: parser
};

/***/ }),
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaults = __webpack_require__(0);
var detectNode = __webpack_require__(2);
var templatePath = /*require.resolve*/(7);

/**
 * 绑定模板文件后缀名，以让 NodeJS 支持 `require(templateFile)`
 * @param {function} require
 * @param {?string} extname 
 */
var bindExtname = function bindExtname(require) {
    var extname = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaults.extname;


    if (detectNode) {
        require.extensions[extname] = function (module, flnm) {
            var filename = flnm || module.filename;
            var imports = 'var template=require(' + JSON.stringify(templatePath) + ')';
            module._compile(imports + ';module.exports = template.compile({filename:' + JSON.stringify(filename) + '});', filename);
        };
    }
};

module.exports = bindExtname;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaults = __webpack_require__(0);

/**
 * 绑定超级模板语法
 * @param {Object} options 
 */
var bindSyntax = function bindSyntax() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaults;


    options.openTag = '{{';
    options.closeTag = '}}';
    options.rawSymbol = '@';
    options.imports = options.imports || {};

    options.imports.$each = function (data, callback) {
        if (Array.isArray(data)) {
            for (var i = 0, len = data.length; i < len; i++) {
                callback(data[i], i, data);
            }
        } else {
            for (var _i in data) {
                callback(data[_i], _i);
            }
        }
    };

    options.parseExpression = function (_ref) {
        var tokens = _ref.tokens,
            line = _ref.line,
            source = _ref.source,
            compiler = _ref.compiler;


        var options = compiler.options;

        // 旧版语法升级提示
        var upgrade = function upgrade(oldSyntax, newSyntax) {
            console.warn('Template upgrade example:', '{{' + oldSyntax + '}}', '>>>', '{{' + newSyntax + '}}', '\n', options.filename || '', line + ':0-' + source.length);
        };

        var escapeSymbol = options.escapeSymbol;
        var rawSymbol = options.rawSymbol;
        var values = tokens.map(function (token) {
            return token.value;
        }).filter(function (value) {
            return (/^\S+$/.test(value)
            );
        });

        // v3 compat: #value
        if (values[0] === '#') {
            upgrade('#value', '@value');
            values[0] = values[0].replace(/^#/, rawSymbol);
        }

        // 输出标志
        var code = '';
        var inputSymbol = values[0] === rawSymbol ? values.shift() : escapeSymbol;

        var close = values[0] === '/' ? values.shift() : '';
        var key = close + values.shift();

        switch (key) {

            case '%':

                // % for (var i = 0; i < data.length; i++){} %
                tokens.shift();

                if (tokens[tokens.length - 1] === key) {
                    tokens.pop();
                }

                code = tokens.join('');
                break;

            case 'set':

                // value = 0
                code = 'var ' + values.join('') + ';';
                break;

            case 'if':

                // value
                // value + 1
                code = 'if(' + values.join('') + '){';
                break;

            case 'else':

                if (values[0] === 'if') {
                    // if value
                    values.shift();
                    code = '}else if(' + values.join('') + '){';
                } else {
                    // else
                    code = '}else{';
                }

                break;

            case '/if':

                // /if
                code = '}';
                break;

            case 'each':

                // 
                // object
                // object value
                // object value index

                // ... v3 compat ...
                // object 'as' value
                // object 'as' value index
                if (values[1] === 'as') {
                    upgrade('each object \'as\' value index', 'each object value index');
                    values.splice(1, 1);
                }

                var object = values[0] || '$data';
                var value = values[1] || '$value';
                var index = values[2] || '$index';

                code = '$each(' + object + ',function(' + value + ',' + index + '){';
                compiler.parseContext('$each');

                break;

            case '/each':

                // /each
                code = '});';
                break;

            case 'echo':

                // echo value
                // echo value value2 value3
                // echo(value + 1, value2)
                code = 'print(' + values.join(',') + ');';
                break;

            case 'print':
            case 'include':

                // print value
                // print value value2 value3
                // include './header'
                // include './header' context
                // include(name + '.html', context)
                code = key + '(' + values.join(',') + ');';
                break;

            default:

                if (values.indexOf('|') !== -1) {

                    // 解析过滤器
                    // value | filter
                    // value|filter
                    // value | filter 'string'
                    // value | filter arg1 arg2 arg3
                    // value | filter1 arg1 | filter2 | filter3
                    // value * 1000 | filter
                    // value[key] | filter
                    // value1 || value2 | filter

                    // ... v3 compat ...
                    // value | filter1:'abcd' | filter2

                    var target = key;
                    var group = [];
                    var v3split = ':';

                    // 找到要过滤的目标表达式
                    // values => ['value', '[', 'key', ']', '|', 'filter1', '|', 'filter2', 'argv1', 'argv2']
                    // target => `value[key]`
                    while (values[0] !== '|') {
                        target += values.shift();
                    } // 将过滤器解析成二维数组
                    // group => [['filter1'], [['filter2', 'argv1', 'argv2']]
                    values.filter(function (v) {
                        return v !== v3split;
                    }).forEach(function (value) {
                        if (value === '|') {
                            group.push([]);
                        } else {
                            group[group.length - 1].push(value);
                        }
                    });

                    // 将过滤器管道化
                    // code => `$imports.filter2($imports.filter1(value[key]),argv1,argv2)`
                    group.reduce(function (accumulator, filter) {
                        var name = filter.shift();
                        filter.unshift(accumulator);
                        return code = '$imports.' + name + '(' + filter.join(',') + ')';
                    }, target);
                } else if (options.imports[key]) {

                    // ... v3 compat ...
                    // helperName value
                    upgrade('filterName value', 'value | filterName');
                    code = key + '(' + values.join(',') + ')';
                    inputSymbol = rawSymbol;
                } else {
                    code = '' + key + code;
                }

                if (inputSymbol === rawSymbol) {
                    code = '$out+=' + code;
                } else {
                    code = '$out+=$escape(' + code + ')';
                    compiler.parseContext('$escape');
                }

                break;
        }

        return code;
    };

    return options;
};

module.exports = bindSyntax;

/***/ }),
/* 24 */,
/* 25 */,
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var template = __webpack_require__(7);
var bindSyntax = __webpack_require__(23);
var bindExtname = __webpack_require__(22);

template.bindExtname = bindExtname;
template.bindSyntax = bindSyntax;

module.exports = template;

/***/ })
/******/ ]);
});