/*! art-template@4.3.2 | https://github.com/aui/art-template */
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
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
/******/ 	return __webpack_require__(__webpack_require__.s = 19);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("detect-node");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Compiler = __webpack_require__(16);
var defaults = __webpack_require__(2);

/**
 * 编译模版
 * @param {string|Object} source   模板内容
 * @param {?Object}       options  编译选项
 * @return {function}
 */
var compile = function compile(source) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


    if ((typeof source === 'undefined' ? 'undefined' : _typeof(source)) === 'object') {
        options = source;
    } else {
        options.source = source;
    }

    // 合并默认配置
    options = defaults.$extend(options);
    source = options.source;

    // debug 模式
    if (options.debug) {
        options.cache = false;
        options.bail = false;
        options.minimize = false;
        options.compileDebug = true;
    }

    // 转换成绝对路径
    if (options.filename) {
        options.filename = options.resolveFilename(options.filename, options);
    }

    var onerror = options.onerror;
    var filename = options.filename;
    var cache = options.cache;
    var caches = options.caches;

    // 匹配缓存
    if (cache && filename) {
        var _render = caches.get(filename);
        if (_render) {
            return _render;
        }
    }

    // 加载外部模板
    if (!source) {

        try {
            source = options.loader(filename, options);
            options.source = source;
        } catch (e) {

            var error = {
                path: filename,
                name: 'CompileError',
                message: 'template not found: ' + e.message,
                stack: e.stack
            };

            if (options.bail) {
                throw error;
            } else {
                return onerror(error, options);
            }
        }
    }

    var compiler = new Compiler(options);

    var render = function render(data, blocks) {

        try {
            return render.source(data, blocks);
        } catch (error) {

            // 运行时出错以调试模式重载
            if (!options.compileDebug) {
                options.cache = false;
                options.compileDebug = true;
                return compile(options)(data, blocks);
            }

            if (options.bail) {
                throw error;
            } else {
                return onerror(error, options)();
            }
        }
    };

    try {
        render.source = compiler.build();

        // 缓存编译成功的模板
        if (cache && filename) {
            caches.set(filename, render);
        }
    } catch (error) {
        if (options.bail) {
            throw error;
        } else {
            return onerror(error, options);
        }
    }

    render.toString = function () {
        return render.source.toString();
    };

    return render;
};

compile.Compiler = Compiler;

module.exports = compile;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var detectNode = __webpack_require__(0);
var onerror = __webpack_require__(12);
var caches = __webpack_require__(6);
var escape = __webpack_require__(8);
var loader = __webpack_require__(11);
var include = __webpack_require__(10);
var each = __webpack_require__(7);
var artRule = __webpack_require__(14);
var nativeRule = __webpack_require__(15);
var htmlMinifier = __webpack_require__(9);
var resolveFilename = __webpack_require__(13);

/** 模板编译器默认配置 */
var defaults = {

    // 模板内容。如果没有此字段，则会根据 filename 来加载模板内容
    source: null,

    // 模板名字
    filename: null,

    // 模板语法规则列表
    rules: [nativeRule, artRule],

    // 是否支持对模板输出语句进行编码。为 false 则关闭编码输出功能
    escape: true,

    // 是否开启调试模式。如果为 true: {bail:false, cache:false, minimize:false, compileDebug:true}
    debug: detectNode ? process.env.NODE_ENV !== 'production' : false,

    // bail 如果为 true，编译错误与运行时错误都会抛出异常
    bail: false,

    // 是否开启缓存
    cache: true,

    // 是否开启压缩。它会运行 htmlMinifier，将页面 HTML、CSS、CSS 进行压缩输出
    // 如果模板包含没有闭合的 HTML 标签，请不要打开 minimize，否则可能被 htmlMinifier 修复或过滤
    minimize: true,

    // 是否编译调试版。编译为调试版本可以在运行时进行 DEBUG
    compileDebug: false,

    // 模板路径转换器
    resolveFilename: resolveFilename,

    // HTML 压缩器。仅在 NodeJS 环境下有效
    htmlMinifier: htmlMinifier,

    // 错误调试器
    onerror: onerror,

    // 模板文件加载器
    loader: loader,

    // 缓存中心适配器（依赖 filename 字段）
    caches: caches,

    // 模板根目录。如果 filename 为全局路径，则会基于此查找模板
    root: '/',

    // 默认后缀名。如果没有后缀名，则会自动基于此补全
    extname: '.art',

    // 导入的模板变量
    imports: {
        $each: each,
        $escape: escape,
        $include: include
    }

};

/**
 * 继承默认配置
 * @param   {Object}    options
 * @return {Object}
 */
defaults.$extend = function (options) {
    var copy = Object.create(this);

    for (var name in options) {
        copy[name] = options[name];
    }

    return copy;
};

module.exports = defaults;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("is-keyword-js");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("js-tokens");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var compile = __webpack_require__(1);

/**
 * 渲染模板
 * @param   {string|Object}     source  模板内容
 * @param   {Object}            data    数据
 * @param   {?Object}           options 选项
 * @return  {string}            渲染好的字符串
 */
var render = function render(source, data, options) {
  return compile(source, options)(data);
};

module.exports = render;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var caches = {
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

module.exports = caches;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * 迭代器，支持数组与对象
 * @param {array|Object} data 
 * @param {function} callback 
 */
var each = function each(data, callback) {
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

module.exports = each;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * 编码模板输出的内容
 * @param  {any}   content
 * @return {string}
 */
var escape = function escape(content) {

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
                // number | array | object | undefined
                value = JSON.stringify(value) || '';
            }
        }

        return value;
    };

    return toString(content).replace(escapeReg, function (s) {
        return escapeMap[s];
    });
};

module.exports = escape;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var detectNode = __webpack_require__(0);

/**
 * HTML 压缩器 
 * @param  {string}     source
 * @param  {Object}     options
 * @return {string}
 */
var htmlMinifier = function htmlMinifier(source, options) {
    if (detectNode) {

        var _htmlMinifier = __webpack_require__(21).minify;
        var ignoreCustomFragments = options.rules.map(function (rule) {
            return rule.test;
        });
        var setting = {
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            ignoreCustomFragments: ignoreCustomFragments
        };

        source = _htmlMinifier(source, setting);
    }

    return source;
};

module.exports = htmlMinifier;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * 载入子模板
 * @param   {string}    filename
 * @param   {Object}    data
 * @param   {Object}    blocks
 * @param   {Object}    options
 * @return  {string}
 */
var include = function include(filename, data, blocks, options) {
    var compile = __webpack_require__(1);
    options = options.$extend({
        filename: options.resolveFilename(filename, options),
        source: null
    });
    return compile(options)(data, blocks);
};

module.exports = include;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var detectNode = __webpack_require__(0);

/**
 * 读取模板内容（同步方法）
 * @param   {string}    filename   模板名
 * @param   {?Object}   options
 * @return  {string}
 */
var loader = function loader(filename /*, options*/) {
    /* istanbul ignore else  */
    if (detectNode) {
        var fs = __webpack_require__(20);
        return fs.readFileSync(filename, 'utf8');
    } else {
        var elem = document.getElementById(filename);
        return elem.value || elem.innerHTML;
    }
};

module.exports = loader;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * 调试器
 * @param   {Object}    error
 * @param   {?Object}   options
 * @return  {function}
 */
var onerror = function onerror(error /*, options*/) {

    if ((typeof console === 'undefined' ? 'undefined' : _typeof(console)) === 'object') {
        var stack = error.stack;
        delete error.stack;
        error = JSON.stringify(error, null, 4);
        console.error('Template Error: ' + error + '\n\n' + stack);
    }

    return function () {
        return '{Template Error}';
    };
};

module.exports = onerror;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var detectNode = __webpack_require__(0);

/**
 * 获取模板的绝对路径
 * @param   {string} filename 
 * @param   {Object} options 
 * @return  {string}
 */
var resolveFilename = function resolveFilename(filename, options) {
    /* istanbul ignore else  */
    if (detectNode) {
        var path = __webpack_require__(22);
        var root = options.root;
        var extname = options.extname;
        var base = filename !== options.filename && options.filename;
        var dirname = base ? path.dirname(base) : '';

        if (!path.extname(filename)) {
            filename = filename + extname;
        }

        return path.resolve(root, dirname, filename);
    } else {
        return filename;
    }
};

module.exports = resolveFilename;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var nativeRule = {
    test: /{{([@#]?)(\/?)([\w\W]*?)}}/,
    use: function use(match, raw, close, code) {

        var compiler = this;
        var options = compiler.options;
        var esTokens = compiler.getEsTokens(code.trim());
        var values = esTokens.map(function (token) {
            return token.value;
        });
        var result = {};

        var group = void 0;
        var output = raw ? 'raw' : false;
        var key = close + values.shift();

        // 旧版语法升级提示
        var upgrade = function upgrade(oldSyntax, newSyntax) {
            console.warn('Template upgrade:', '{{' + oldSyntax + '}}', '>>>', '{{' + newSyntax + '}}', '\n', options.filename || '');
        };

        // v3 compat: #value
        if (raw === '#') {
            upgrade('#value', '@value');
        }

        switch (key) {

            case 'set':

                code = 'var ' + values.join('');
                break;

            case 'if':

                code = 'if(' + values.join('') + '){';

                break;

            case 'else':

                var indexIf = values.indexOf('if');

                if (indexIf > -1) {
                    values.splice(0, indexIf + 1);
                    code = '}else if(' + values.join('') + '){';
                } else {
                    code = '}else{';
                }

                break;

            case '/if':

                code = '}';
                break;

            case 'each':

                group = split(esTokens);
                group.shift();

                if (group[1] === 'as') {
                    // ... v3 compat ...
                    upgrade('each object as value index', 'each object value index');
                    group.splice(1, 1);
                }

                var object = group[0] || '$data';
                var value = group[1] || '$value';
                var index = group[2] || '$index';

                code = '$each(' + object + ',function(' + value + ',' + index + '){';

                break;

            case '/each':

                code = '})';
                break;

            case 'echo':

                key = 'print';
                upgrade('echo value', 'value');

            case 'print':
            case 'include':
            case 'extend':

                group = split(esTokens);
                group.shift();
                code = key + '(' + group.join(',') + ')';
                break;

            case 'block':

                code = 'block(' + values.join('') + ',function(){';
                break;

            case '/block':

                code = '})';
                break;

            default:

                if (values.indexOf('|') !== -1) {

                    // 解析过滤器

                    var target = key;
                    var _group = [];
                    var v3split = ':'; // ... v3 compat ...
                    var list = values.filter(function (value) {
                        return !/^\s+$/.test(value);
                    });

                    // 找到要过滤的目标表达式
                    while (list[0] !== '|') {
                        target += list.shift();
                    } // 将过滤器解析成二维数组
                    list.filter(function (v) {
                        return v !== v3split;
                    }).forEach(function (value) {
                        if (value === '|') {
                            _group.push([]);
                        } else {
                            _group[_group.length - 1].push(value);
                        }
                    });

                    // 将过滤器管道化
                    _group.reduce(function (accumulator, filter) {
                        var name = filter.shift();
                        filter.unshift(accumulator);
                        return code = name + '(' + filter.join(',') + ')';
                    }, target);
                } else if (options.imports[key]) {

                    // ... v3 compat ...
                    upgrade('filterName value', 'value | filterName');

                    group = split(esTokens);
                    group.shift();

                    code = key + '(' + group.join(',') + ')';
                    output = 'raw';
                } else {
                    code = '' + key + values.join('');
                }

                if (!output) {
                    output = 'escape';
                }

                break;
        }

        result.code = code;
        result.output = output;

        return result;
    }
};

// 按照空格分组
var split = function split(esTokens) {
    var current = 0;
    var lastToken = esTokens.shift();
    var group = [[lastToken]];

    while (current < esTokens.length) {
        var esToken = esTokens[current];
        var esTokenType = esToken.type;

        if (esTokenType !== 'whitespace' && esTokenType !== 'comment') {

            if (lastToken.type === 'punctuator' && lastToken.value !== ']' || esTokenType === 'punctuator') {
                group[group.length - 1].push(esToken);
            } else {
                group.push([esToken]);
            }

            lastToken = esToken;
        }

        current++;
    }

    return group.map(function (g) {
        return g.map(function (g) {
            return g.value;
        }).join('');
    });
};

// mocha use
nativeRule._split = split;

module.exports = nativeRule;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var nativeRule = {
    test: /<%(#?)((?:==|=#|[=-])?)([\w\W]*?)(-?)%>/,
    use: function use(match, comment, output, code) {

        var outputType = {
            '-': 'raw',
            '=': 'escape',
            '': false,
            // v3 compat: raw output
            '==': 'raw',
            '=#': 'raw'
        };

        // ejs compat: comment tag
        if (comment) {
            code = '//' + code;
        }

        // ejs compat: trims following newline
        //if (trtimMode) {}

        return {
            code: code,
            output: outputType[output]
        };
    }
};

module.exports = nativeRule;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isKeyword = __webpack_require__(3);
var esTokenizer = __webpack_require__(17);
var tplTokenizer = __webpack_require__(18);

/** 传递给模板的数据引用 */
var DATA = '$data';

/** 外部导入的所有全局变量引用 */
var IMPORTS = '$imports';

/**  $imports.$escape */
var ESCAPE = '$escape';

/** 文本输出函数 */
var PRINT = 'print';

/** 包含子模板函数 */
var INCLUDE = 'include';

/** 继承布局模板函数 */
var EXTEND = 'extend';

/** “模板块”读写函数 */
var BLOCK = 'block';

/** 字符串拼接变量 */
var OUT = '$$out';

/** 运行时逐行调试记录变量 [line, start, source] */
var LINE = '$$line';

/** 所有“模板块”变量 */
var BLOCKS = '$$blocks';

/** 继承的布局模板的文件地址变量 */
var FROM = '$$from';

/** 导出布局模板函数 */
var LAYOUT = '$$layout';

/** 编译设置变量 */
var OPTIONS = '$$options';

var has = function has(object, key) {
    return object.hasOwnProperty(key);
};
var stringify = JSON.stringify;

var Compiler = function () {

    /**
     * 模板编译器
     * @param   {Object}    options
     */
    function Compiler(options) {
        var _external,
            _internal,
            _dependencies,
            _this = this;

        _classCallCheck(this, Compiler);

        var source = options.source;
        var minimize = options.minimize;
        var htmlMinifier = options.htmlMinifier;

        // 编译选项
        this.options = options;

        // 记录编译后生成的代码
        this.scripts = [];

        // 运行时注入的上下文
        this.context = [];

        // context map
        this.CONTEXT_MAP = {};

        // 外部变量名单
        this.external = (_external = {}, _defineProperty(_external, DATA, true), _defineProperty(_external, IMPORTS, true), _defineProperty(_external, OPTIONS, true), _external);

        // 按需编译到模板渲染函数的内置变量
        this.internal = (_internal = {}, _defineProperty(_internal, OUT, '\'\''), _defineProperty(_internal, LINE, '[0,0,\'\']'), _defineProperty(_internal, BLOCKS, 'arguments[1]||{}'), _defineProperty(_internal, FROM, 'null'), _defineProperty(_internal, LAYOUT, 'function(){return ' + IMPORTS + '.$include(' + FROM + ',' + DATA + ',' + BLOCKS + ',' + OPTIONS + ')}'), _defineProperty(_internal, PRINT, 'function(){' + OUT + '+=\'\'.concat.apply(\'\',arguments)}'), _defineProperty(_internal, INCLUDE, 'function(src,data,block){' + OUT + '+=' + IMPORTS + '.$include(src,data||' + DATA + ',block,' + OPTIONS + ')}'), _defineProperty(_internal, EXTEND, 'function(from){' + FROM + '=from}'), _defineProperty(_internal, BLOCK, 'function(name,callback){if(' + FROM + '){' + OUT + '=\'\';callback();' + BLOCKS + '[name]=' + OUT + '}else{if(typeof ' + BLOCKS + '[name]===\'string\'){' + OUT + '+=' + BLOCKS + '[name]}else{callback()}}}'), _internal);

        // 内置函数依赖关系声明
        this.dependencies = (_dependencies = {}, _defineProperty(_dependencies, PRINT, [OUT]), _defineProperty(_dependencies, INCLUDE, [OUT, IMPORTS, DATA, OPTIONS]), _defineProperty(_dependencies, EXTEND, [FROM, /*[*/LAYOUT /*]*/]), _defineProperty(_dependencies, BLOCK, [FROM, OUT, BLOCKS]), _defineProperty(_dependencies, LAYOUT, [IMPORTS, FROM, DATA, BLOCKS, OPTIONS]), _dependencies);

        this.importContext(OUT);

        if (options.compileDebug) {
            this.importContext(LINE);
        }

        if (minimize) {
            try {
                source = htmlMinifier(source, options);
            } catch (error) {}
        }

        this.getTplTokens(source, options.rules, this).forEach(function (tokens) {
            if (tokens.type === tplTokenizer.TYPE_STRING) {
                _this.parseString(tokens);
            } else {
                _this.parseExpression(tokens);
            }
        });
    }

    /**
     * 将模板代码转换成 tplToken 数组
     * @param   {string} source 
     * @return  {Object[]}
     */


    _createClass(Compiler, [{
        key: 'getTplTokens',
        value: function getTplTokens() {
            return tplTokenizer.apply(undefined, arguments);
        }

        /**
         * 将模板表达式转换成 esToken 数组
         * @param   {string} source 
         * @return  {Object[]}
         */

    }, {
        key: 'getEsTokens',
        value: function getEsTokens(source) {
            return esTokenizer(source);
        }

        /**
         * 获取变量列表
         * @param {Object[]} esTokens
         * @return {string[]}
         */

    }, {
        key: 'getVariables',
        value: function getVariables(esTokens) {
            var ignore = false;
            return esTokens.filter(function (esToken) {
                return esToken.type !== 'whitespace' && esToken.type !== 'comment';
            }).filter(function (esToken) {
                if (esToken.type === 'name' && !ignore) {
                    return true;
                }

                ignore = esToken.type === 'punctuator' && esToken.value === '.';

                return false;
            }).map(function (tooken) {
                return tooken.value;
            });
        }

        /**
         * 导入模板上下文
         * @param {string} name 
         */

    }, {
        key: 'importContext',
        value: function importContext(name) {
            var _this2 = this;

            var value = '';
            var internal = this.internal;
            var dependencies = this.dependencies;
            var external = this.external;
            var context = this.context;
            var options = this.options;
            var imports = options.imports;
            var contextMap = this.CONTEXT_MAP;

            if (!has(contextMap, name) && !has(external, name) && !isKeyword(name)) {

                if (has(internal, name)) {
                    value = internal[name];

                    if (has(dependencies, name)) {
                        dependencies[name].forEach(function (name) {
                            return _this2.importContext(name);
                        });
                    }
                } else if (has(imports, name)) {
                    value = IMPORTS + '.' + name;
                } else {
                    value = DATA + '.' + name;
                }

                contextMap[name] = value;
                context.push({
                    name: name,
                    value: value
                });
            }
        }

        /**
         * 解析字符串（HTML）直接输出语句
         * @param {Object} tplToken 
         */

    }, {
        key: 'parseString',
        value: function parseString(tplToken) {

            var source = tplToken.value;

            if (!source) {
                return;
            }

            var code = OUT + '+=' + stringify(source);
            this.scripts.push({
                source: source,
                tplToken: tplToken,
                code: code
            });
        }

        /**
         * 解析逻辑表达式语句
         * @param {Object} tplToken 
         */

    }, {
        key: 'parseExpression',
        value: function parseExpression(tplToken) {
            var _this3 = this;

            var source = tplToken.value;
            var line = tplToken.line;
            var start = tplToken.start;
            var options = this.options;
            var compileDebug = options.compileDebug;
            var script = tplToken.script;
            var output = script.output;
            var code = script.code.trim();

            if (output) {
                if (escape === false || output === tplTokenizer.TYPE_RAW) {
                    code = OUT + '+=' + script.code;
                } else {
                    code = OUT + '+=' + ESCAPE + '(' + script.code + ')';
                }
            }

            if (compileDebug) {
                var lineData = [line, start, stringify(source)].join(',');
                this.scripts.push({
                    source: source,
                    tplToken: tplToken,
                    code: LINE + '=[' + lineData + ']'
                });
            }

            var esToken = this.getEsTokens(code);
            this.getVariables(esToken).forEach(function (name) {
                return _this3.importContext(name);
            });

            this.scripts.push({
                source: source,
                tplToken: tplToken,
                code: code
            });
        }

        /**
         * 检查解析后的模板语句是否存在语法错误
         * @param  {string} script 
         * @return {boolean}
         */

    }, {
        key: 'checkExpression',
        value: function checkExpression(script) {

            // 没有闭合的块级模板语句规则
            var rules = [

            // <% } %>
            // <% }else{ %>
            // <% }else if(a){ %>
            [/^\s*?}.*?{?[\s;]*?$/, ''],

            // <% list.forEach(function(a,b){ %>
            [/(^[\w\W]*?\s*?function\s*?\([\w\W]*?\)\s*?{[\s;]*?$)/, '$1})'],

            // <% list.forEach((a,b)=>{ %>
            [/(^.*?\(\s*?[\w\W]*?=>\s*?{[\s;]*?$)/, '$1})'],

            // <% if(a){ %>
            // <% for(var i in d){ %>
            [/(^[\w\W]*?\([\w\W]*?\)\s*?{[\s;]*?$)/, '$1}']];

            var index = 0;
            while (index < rules.length) {
                if (rules[index][0].test(script)) {
                    var _script;

                    script = (_script = script).replace.apply(_script, _toConsumableArray(rules[index]));
                    break;
                }
                index++;
            };

            try {
                new Function(script);
                return true;
            } catch (e) {
                return false;
            }
        }

        /**
         * 编译
         * @return  {function}
         */

    }, {
        key: 'build',
        value: function build() {

            var options = this.options;
            var context = this.context;
            var scripts = this.scripts;
            var source = options.source;
            var filename = options.filename;
            var imports = options.imports;
            var extendMode = has(this.CONTEXT_MAP, EXTEND);

            var useStrictCode = '\'use strict\'';
            var contextCode = 'var ' + context.map(function (_ref) {
                var name = _ref.name,
                    value = _ref.value;
                return name + '=' + value;
            }).join(',');
            var scriptsCode = scripts.map(function (script) {
                return script.code;
            }).join('\n');
            var returnCode = extendMode ? 'return ' + LAYOUT + '()' : 'return ' + OUT;

            var renderCode = [useStrictCode, contextCode, scriptsCode, returnCode].join('\n');

            if (options.compileDebug) {
                var throwCode = '{' + ['path:' + stringify(filename), 'name:\'RuntimeError\'', 'message:error.message', 'line:' + LINE + '[0]+1', 'start:' + LINE + '[1]+1', 'source:' + LINE + '[2]', 'stack:error.stack'].join(',') + '}';
                renderCode = 'try{' + renderCode + '}catch(error){throw ' + throwCode + '}';
            }

            renderCode = 'function(' + DATA + '){\n' + renderCode + '\n}';

            try {
                return new Function(IMPORTS, OPTIONS, 'return ' + renderCode)(imports, options);
            } catch (e) {

                var index = 0;
                var line = 0;
                var start = 0;
                var source2 = source;

                while (index < scripts.length) {
                    var current = scripts[index];
                    if (!this.checkExpression(current.code)) {
                        source2 = current.source;
                        line = current.tplToken.line;
                        start = current.tplToken.start;
                        break;
                    }
                    index++;
                };

                throw {
                    path: filename,
                    name: 'CompileError',
                    message: e.message,
                    line: line + 1,
                    start: start + 1,
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

/**
 * 模板内置常量
 */
Compiler.CONSTS = {
    DATA: DATA,
    IMPORTS: IMPORTS,
    PRINT: PRINT,
    INCLUDE: INCLUDE,
    EXTEND: EXTEND,
    BLOCK: BLOCK,
    OPTIONS: OPTIONS,
    OUT: OUT,
    LINE: LINE,
    BLOCKS: BLOCKS,
    FROM: FROM,
    LAYOUT: LAYOUT,
    ESCAPE: ESCAPE
};

module.exports = Compiler;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var jsTokens = __webpack_require__(4).default;
var matchToToken = __webpack_require__(4).matchToToken;
var isKeyword = __webpack_require__(3);

/**
 * 将逻辑表达式解释为 Tokens
 * @param {string} code
 * @return {Object[]}
 */
var esTokenizer = function esTokenizer(code) {
    var tokens = code.match(jsTokens).map(function (value) {
        jsTokens.lastIndex = 0;
        return matchToToken(jsTokens.exec(value));
    }).map(function (token) {
        if (token.type === 'name' && isKeyword(token.value)) {
            token.type = 'keyword';
        }
        return token;
    });

    return tokens;
};

module.exports = esTokenizer;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var TYPE_STRING = 'string';
var TYPE_EXPRESSION = 'expression';
var TYPE_RAW = 'raw';
var TYPE_ESCAPE = 'escape';

/**
 * 将模板转换为 Tokens
 * @param {string}      source 
 * @param {Object[]}    rules     @see defaults.rules
 * @param {Object}      context
 * @return {Object[]}
 */
var tplTokenizer = function tplTokenizer(source, rules, context) {

    var tokens = [{
        type: TYPE_STRING,
        value: source,
        line: 0,
        start: 0,
        end: source.length
    }];

    var walk = function walk(rule) {

        var flags = rule.test.ignoreCase ? 'ig' : 'g';
        var pattern = rule.test.source + '|^$|[\\w\\W]';
        var group = new RegExp(pattern, flags);

        for (var index = 0; index < tokens.length; index++) {

            if (tokens[index].type !== TYPE_STRING) {
                continue;
            }

            var line = tokens[index].line;
            var start = tokens[index].start;
            var end = tokens[index].end;

            var matchs = tokens[index].value.match(group);
            var substitute = [];

            for (var m = 0; m < matchs.length; m++) {
                var value = matchs[m];

                rule.test.lastIndex = 0;

                var values = rule.test.exec(value);
                var type = values ? TYPE_EXPRESSION : TYPE_STRING;
                var lastSubstitute = substitute[substitute.length - 1];
                var lastToken = lastSubstitute || tokens[index];
                var lastValue = lastToken.value;

                if (lastToken.line === line) {
                    start = lastSubstitute ? lastSubstitute.end : start;
                } else {
                    start = lastValue.length - lastValue.lastIndexOf('\n') - 1;
                }

                end = start + value.length;

                var token = { type: type, value: value, line: line, start: start, end: end };

                if (type === TYPE_STRING) {

                    if (lastSubstitute && lastSubstitute.type === TYPE_STRING) {

                        lastSubstitute.value += value;
                        lastSubstitute.end += value.length;
                    } else {

                        substitute.push(token);
                    }
                } else {

                    var script = rule.use.apply(context, values);
                    token.script = script;
                    substitute.push(token);
                }

                line += value.split(/\n/).length - 1;
            }

            tokens.splice.apply(tokens, [index, 1].concat(substitute));
            index += substitute.length - 1;
        }
    };

    for (var i = 0; i < rules.length; i++) {
        walk(rules[i]);
    }

    return tokens;
};

tplTokenizer.TYPE_STRING = TYPE_STRING;
tplTokenizer.TYPE_EXPRESSION = TYPE_EXPRESSION;
tplTokenizer.TYPE_RAW = TYPE_RAW;
tplTokenizer.TYPE_ESCAPE = TYPE_ESCAPE;

module.exports = tplTokenizer;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var render = __webpack_require__(5);
var compile = __webpack_require__(1);
var defaults = __webpack_require__(2);

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
/* 20 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("html-minifier");

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ })
/******/ ]);