/*!
 * artTemplate - Template Engine
 * https://github.com/aui/artTemplate
 * Released under the MIT, BSD, and GPL Licenses
 * Email: 1987.tangbin@gmail.com
 */
 

/**
 * 模板引擎路由函数
 * 若第二个参数类型为 Object 则执行 render 方法, 否则 compile 方法
 * @name    template
 * @param   {String}            模板ID (可选)
 * @param   {Object, String}    数据或者模板字符串
 * @return  {String, Function}  渲染好的HTML字符串或者渲染方法
 */
var template = function (id, content) {
    return template[
        typeof content === 'object' ? 'render' : 'compile'
    ].apply(template, arguments);
};




(function (exports, global) {


'use strict';
exports.version = '2.0.0'; 
exports.openTag = '<%';     // 设置逻辑语法开始标签
exports.closeTag = '%>';    // 设置逻辑语法结束标签
exports.isEscape = true;    // HTML字符编码输出开关
exports.isCompress = false;	// 剔除渲染后HTML多余的空白开关
exports.parser = null;      // 自定义语法插件接口



/**
 * 渲染模板
 * @name    template.render
 * @param   {String}    模板ID
 * @param   {Object}    数据
 * @return  {String}    渲染好的HTML字符串
 */
exports.render = function (id, data) {

    var cache = _getCache(id);
    
    if (cache === undefined) {

        return _debug({
            id: id,
            name: 'Render Error',
            message: 'No Template'
        });
        
    }
    
    return cache(data); 
};



/**
 * 编译模板
 * 2012-6-6:
 * define 方法名改为 compile,
 * 与 Node Express 保持一致,
 * 感谢 TooBug 提供帮助!
 * @name    template.compile
 * @param   {String}    模板ID (可选)
 * @param   {String}    模板字符串
 * @return  {Function}  渲染方法
 */
exports.compile = function (id, source) {
    
    var params = arguments;
    var isDebug = params[2];
    var anonymous = 'anonymous';
    
    if (typeof source !== 'string') {
        isDebug = params[1];
        source = params[0];
        id = anonymous;
    }

    
    try {
        
        var Render = _compile(source, isDebug);
        
    } catch (e) {
    
        e.id = id || source;
        e.name = 'Syntax Error';

        return _debug(e);
        
    }
    
    
    function render (data) {
        
        try {
            
            return new Render(data) + '';
            
        } catch (e) {
            
            if (!isDebug) {
                return exports.compile(id, source, true)(data);
            }
			
            e.id = id || source;
            e.name = 'Render Error';
            e.source = source;
            
            return _debug(e);
            
        };
        
    };
    

    render.prototype = Render.prototype;
    render.toString = function () {
        return Render.toString();
    };
    
    
    if (id !== anonymous) {
        _cache[id] = render;
    }

    
    return render;

};




/**
 * 添加模板辅助方法
 * @name    template.helper
 * @param   {String}    名称
 * @param   {Function}  方法
 */
exports.helper = function (name, helper) {
    exports.prototype[name] = helper;
};




/**
 * 模板错误事件
 * @name    template.onerror
 * @event
 */
exports.onerror = function (e) {
    var content = '[template]:\n'
        + e.id
        + '\n\n[name]:\n'
        + e.name;

    if (e.message) {
        content += '\n\n[message]:\n'
        + e.message;
    }
    
    if (e.line) {
        content += '\n\n[line]:\n'
        + e.line;
        content += '\n\n[source]:\n'
        + e.source.split(/\n/)[e.line - 1].replace(/^[\s\t]+/, '');
    }
    
    if (e.temp) {
        content += '\n\n[temp]:\n'
        + e.temp;
    }
    
    if (global.console) {
        console.error(content);
    }
};



// 编译好的函数缓存
var _cache = {};



// 获取模板缓存
var _getCache = function (id) {

    var cache = _cache[id];
    
    if (cache === undefined && 'document' in global) {
        var elem = document.getElementById(id);
        
        if (elem) {
            var source = elem.value || elem.innerHTML;
            return exports.compile(id, source.replace(/^\s*|\s*$/g, ''));
        }
        
    } else if (_cache.hasOwnProperty(id)) {
    
        return cache;
    }
};



// 模板调试器
var _debug = function (e) {

    exports.onerror(e);
    
    function error () {
        return error + '';
    };
    
    error.toString = function () {
        return '{Template Error}';
    };
    
    return error;
};



// 模板编译器
var _compile = (function () {


    // 辅助方法集合
    exports.prototype = {
        $render: exports.render,
        $escapeHTML: function (content) {

            return typeof content === 'string'
            ? content.replace(/&(?![\w#]+;)|[<>"']/g, function (s) {
                return {
                    "<": "&#60;",
                    ">": "&#62;",
                    '"': "&#34;",
                    "'": "&#39;",
                    "&": "&#38;"
                }[s];
            })
            : content;
        },
        $getValue: function (value) {

            if (typeof value === 'string' || typeof value === 'number') {

                return value;

            } else if (typeof value === 'function') {

                return value();

            } else {

                return '';

            }

        }
    };


    var arrayforEach =  Array.prototype.forEach || function (block, thisObject) {
        var len = this.length >>> 0;
        
        for (var i = 0; i < len; i++) {
            if (i in this) {
                block.call(thisObject, this[i], i, this);
            }
        }
        
    };


    // 数组迭代
    var forEach = function (array, callback) {
        arrayforEach.call(array, callback);
    };


    var keyWords =
        // 关键字
        'break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if'
        + ',in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with'
        
        // 保留字
        + ',abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto'
        + ',implements,import,int,interface,long,native,package,private,protected,public,short'
        + ',static,super,synchronized,throws,transient,volatile'
        
        // ECMA 5 - use strict
        + ',arguments,let,yield'

        + ',undefined';

    var filter = new RegExp([

        // 注释
        "/\\*(.|\n)*?\\*/|//[^\n]*\n|//[^\n]*$",

        // 字符串
        "'[^']*'|\"[^\"]*\"",

        // 方法
        "\\.[\s\t\n]*[\\$\\w]+",

        // 关键字
        "\\b" + keyWords.replace(/,/g, '\\b|\\b') + "\\b"


    ].join('|'), 'g');



    // 提取js源码中所有变量
    var _getVariable = function (code) {

        code = code
        .replace(filter, ',')
        .replace(/[^\w\$]+/g, ',')
        .replace(/^,|^\d+|,\d+|,$/g, '');

        return code ? code.split(',') : []; 
    };


    return function (source, isDebug) {
        
        var openTag = exports.openTag;
        var closeTag = exports.closeTag;
        var parser = exports.parser;

        
        var code = source;
        var tempCode = '';
        var line = 1;
        var uniq = {$data:true,$helpers:true,$out:true,$line:true};
        var helpers = exports.prototype;
        var prototype = {};

        
        var variables = "var $helpers=this,"
        + (isDebug ? "$line=0," : "");

        var isNewEngine = ''.trim;// '__proto__' in {}
        var replaces = isNewEngine
        ? ["$out='';", "$out+=", ";", "$out"]
        : ["$out=[];", "$out.push(", ");", "$out.join('')"];

        var concat = isNewEngine
            ? "if(content!==undefined){$out+=content;return content}"
            : "$out.push(content);";
              
        var print = "function(content){" + concat + "}";

        var include = "function(id,data){"
        +     "if(data===undefined){data=$data}"
        +     "var content=$helpers.$render(id,data);"
        +     concat
        + "}";
        
        
        // html与逻辑语法分离
        forEach(code.split(openTag), function (code, i) {
            code = code.split(closeTag);
            
            var $0 = code[0];
            var $1 = code[1];
            
            // code: [html]
            if (code.length === 1) {
                
                tempCode += html($0);
             
            // code: [logic, html]
            } else {
                
                tempCode += logic($0);
                
                if ($1) {
                    tempCode += html($1);
                }
            }
            

        });
        
        
        
        code = tempCode;
        
        
        // 调试语句
        if (isDebug) {
            code = 'try{' + code + '}catch(e){'
            +       'e.line=$line;'
            +       'throw e'
            + '}';
        }
        
        
        code = "'use strict';"
        + variables + replaces[0] + code + 'return new String(' + replaces[3] + ')';
        
        
        try {
            
            var Render = new Function('$data', code);
            Render.prototype = prototype;

            return Render;
            
        } catch (e) {
            e.temp = 'function anonymous($data) {' + code + '}';
            throw e;
        };



        
        // 处理 HTML 语句
        function html (code) {
            
            // 记录行号
            line += code.split(/\n/).length - 1;
			
			if (exports.isCompress) {
				code = code.replace(/[\n\r\t\s]+/g, ' ');
			}
            
            code = code
            // 单双引号与反斜杠转义
            .replace(/('|"|\\)/g, '\\$1')
            // 换行符转义(windows + linux)
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n');
            
            code = replaces[1] + "'" + code + "'" + replaces[2];
            
            return code + '\n';
        };
        
        
        // 处理逻辑语句
        function logic (code) {

            var thisLine = line;
           
            if (parser) {
            
                 // 语法转换插件钩子
                code = parser(code);
                
            } else if (isDebug) {
            
                // 记录行号
                code = code.replace(/\n/g, function () {
                    line ++;
                    return '$line=' + line +  ';';
                });
                
            }
            
            
            // 输出语句. 转义: <%=value%> 不转义:<%==value%>
            if (code.indexOf('=') === 0) {

                var isEscape = code.indexOf('==') !== 0;

                code = code.replace(/^=*|[\s;]*$/g, '');

                if (isEscape && exports.isEscape) {

                    // 转义处理，但排除辅助方法
                    var name = code.replace(/\s*\([^\)]+\)/, '');
                    if (!helpers.hasOwnProperty(name) && !/^(include|print)$/.test(name)) {
                        code = '$escapeHTML($getValue(' + code + '))';
                    }

                } else {
                    code = '$getValue(' + code + ')';
                }
                

                code = replaces[1] + code + replaces[2];

            }
            
            if (isDebug) {
                code = '$line=' + thisLine + ';' + code;
            }
            
            getKey(code);
            
            return code + '\n';
        };
        
        
        // 提取模板中的变量名
        function getKey (code) {
            
            code = _getVariable(code);
            
            // 分词
            forEach(code, function (name) {
             
                // 除重
                if (!uniq.hasOwnProperty(name)) {
                    setValue(name);
                    uniq[name] = true;
                }
                
            });
            
        };
        
        
        // 声明模板变量
        // 赋值优先级:
        // 内置特权方法(include, print) > 私有模板辅助方法 > 数据 > 公用模板辅助方法
        function setValue (name) {

            var value;

            if (name === 'print') {

                value = print;

            } else if (name === 'include') {
                
                prototype['$render'] = helpers['$render'];
                value = include;
                
            } else {

                value = '$data.' + name;

                if (helpers.hasOwnProperty(name)) {

                    prototype[name] = helpers[name];

                    if (name.indexOf('$') === 0) {
                        value = '$helpers.' + name;
                    } else {
                        value = value + '===undefined?$helpers.' + name + ':' + value;
                    }
                }
                
                
            }
            
            variables += name + '=' + value + ',';
        };
        
        
    };
})();




})(template, this);


if (typeof module !== 'undefined' && module.exports) {
    module.exports = template;    
}
