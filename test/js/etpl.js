/**
 * ETPL (Enterprise Template)
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 模板引擎
 * @author errorrik(errorrik@gmail.com)
 *         otakustay(otakustay@gmail.com)
 */

// 有的正则比较长，所以特别放开一些限制
/* jshint maxdepth: 10, unused: false, white: false */

// HACK: 可见的重复代码未抽取成function和var是为了gzip size，吐槽的一边去

(function (root) {
    /**
     * 对象属性拷贝
     * 
     * @inner
     * @param {Object} target 目标对象
     * @param {Object} source 源对象
     * @return {Object} 返回目标对象
     */
    function extend( target, source ) {
        for ( var key in source ) {
            if ( source.hasOwnProperty( key ) ) {
                target[ key ] = source[ key ];
            }
        }

        return target;
    }

    /**
     * 随手写了个栈
     *
     * @inner
     * @constructor
     */
    function Stack() {
        this.raw = [];
        this.length = 0;
    }

    Stack.prototype = {
        /**
         * 添加元素进栈
         *
         * @param {*} elem 添加项
         */
        push: function ( elem ) {
            this.raw[ this.length++ ] = elem;
        },

        /**
         * 弹出顶部元素
         *
         * @return {*}
         */
        pop: function () {
            if ( this.length > 0 ) {
                var elem = this.raw[ --this.length ];
                this.raw.length = this.length;
                return elem;
            }
        },

        /**
         * 获取顶部元素
         *
         * @return {*}
         */
        top: function () {
            return this.raw[ this.length - 1 ];
        },

        /**
         * 获取底部元素
         *
         * @return {*}
         */
        bottom: function () {
            return this.raw[ 0 ];
        },

        /**
         * 根据查询条件获取元素
         * 
         * @param {Function} condition 查询函数
         * @return {*}
         */
        find: function ( condition ) {
            var index = this.length;
            while ( index-- ) {
                var item = this.raw[ index ];
                if ( condition( item ) ) {
                    return item;
                }
            }
        }
    };

    /**
     * 唯一id的起始值
     * 
     * @inner
     * @type {number}
     */
    var guidIndex = 0x2B845;

    /**
     * 获取唯一id，用于匿名target或编译代码的变量名生成
     * 
     * @inner
     * @return {string}
     */
    function generateGUID() {
        return '___' + (guidIndex++);
    }

    /**
     * 构建类之间的继承关系
     * 
     * @inner
     * @param {Function} subClass 子类函数
     * @param {Function} superClass 父类函数
     */
    function inherits( subClass, superClass ) {
        var F = new Function();
        F.prototype = superClass.prototype;
        subClass.prototype = new F();
        subClass.prototype.constructor = subClass;
        // 由于引擎内部的使用场景都是inherits后，逐个编写子类的prototype方法
        // 所以，不考虑将原有子类prototype缓存再逐个拷贝回去
    }

    /**
     * HTML Filter替换的字符实体表
     * 
     * @const
     * @inner
     * @type {Object}
     */
    var HTML_ENTITY = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    /**
     * HTML Filter的替换函数
     * 
     * @inner
     * @param {string} c 替换字符
     * @return {string}
     */
    function htmlFilterReplacer( c ) {
        return HTML_ENTITY[ c ];
    }

    /**
     * 默认filter
     * 
     * @inner
     * @const
     * @type {Object}
     */
    var DEFAULT_FILTERS = {
        /**
         * HTML转义filter
         * 
         * @param {string} source 源串
         * @return {string}
         */
        html: function ( source ) {
            return source.replace( /[&<>"']/g, htmlFilterReplacer );
        },

        /**
         * URL编码filter
         * 
         * @param {string} source 源串
         * @return {string}
         */
        url: encodeURIComponent,

        /**
         * 源串filter，用于在默认开启HTML转义时获取源串，不进行转义
         * 
         * @param {string} source 源串
         * @return {string}
         */
        raw: function ( source ) {
            return source;
        }
    };

    /**
     * 字符串字面化
     * 
     * @inner
     * @param {string} source 需要字面化的字符串
     * @return {string}
     */
    function stringLiteralize( source ) {
        return '"'
            + source
                .replace( /\x5C/g, '\\\\' )
                .replace( /"/g, '\\"' )
                .replace( /\x0A/g, '\\n' )
                .replace( /\x09/g, '\\t' )
                .replace( /\x0D/g, '\\r' )
                // .replace( /\x08/g, '\\b' )
                // .replace( /\x0C/g, '\\f' )
            + '"';
    }

    /**
     * 字符串格式化
     * 
     * @inner
     * @param {string} source 目标模版字符串
     * @param {...string} replacements 字符串替换项集合
     * @return {string}
     */
    function stringFormat( source ) {
        var args = arguments;
        return source.replace( 
            /\{([0-9]+)\}/g,
            function ( match, index ) {
                return args[ index - 0 + 1 ];
            } );
    }

    /**
     * 用于render的字符串变量声明语句
     * 
     * @inner
     * @const
     * @type {string}
     */
    var RENDER_STRING_DECLATION = 'var r="";';

    /**
     * 用于render的字符串内容添加语句（起始）
     * 
     * @inner
     * @const
     * @type {string}
     */
    var RENDER_STRING_ADD_START = 'r+=';

    /**
     * 用于render的字符串内容添加语句（结束）
     * 
     * @inner
     * @const
     * @type {string}
     */
    var RENDER_STRING_ADD_END = ';';

    /**
     * 用于render的字符串内容返回语句
     * 
     * @inner
     * @const
     * @type {string}
     */
    var RENDER_STRING_RETURN = 'return r;';

    // HACK: IE8-时，编译后的renderer使用join Array的策略进行字符串拼接
    if ( typeof navigator != 'undefined' 
        && /msie\s*([0-9]+)/i.test( navigator.userAgent )
        && RegExp.$1 - 0 < 8
    ) {
        RENDER_STRING_DECLATION = 'var r=[],ri=0;';
        RENDER_STRING_ADD_START = 'r[ri++]=';
        RENDER_STRING_RETURN = 'return r.join("");';
    }

    /**
     * 将访问变量名称转换成getVariable调用的编译语句
     * 用于if、var等命令生成编译代码
     * 
     * @inner
     * @param {string} name 访问变量名
     * @return {string}
     */
    function toGetVariableLiteral( name ) {
        name = name.replace( /^\s*\*/, '' );
        return stringFormat(
            'gv({0},["{1}"])',
            stringLiteralize( name ),
            name.replace(
                    /\[['"]?([^'"]+)['"]?\]/g, 
                    function ( match, name ) {
                        return '.' + name;
                    }
                )
                .split( '.' )
                .join( '","' )
        );
    }

    /**
     * 解析文本片段中以固定字符串开头和结尾的包含块
     * 用于 命令串：<!-- ... --> 和 变量替换串：${...} 的解析
     * 
     * @inner
     * @param {string} source 要解析的文本
     * @param {string} open 包含块开头
     * @param {string} close 包含块结束
     * @param {boolean} greedy 是否贪婪匹配
     * @param {function({string})} onInBlock 包含块内文本的处理函数
     * @param {function({string})} onOutBlock 非包含块内文本的处理函数
     */
    function parseTextBlock( source, open, close, greedy, onInBlock, onOutBlock ) {
        var closeLen = close.length;
        var texts = source.split( open );
        var level = 0;
        var buf = [];

        for ( var i = 0, len = texts.length; i < len; i++ ) {
            var text = texts[ i ];

            if ( i ) {
                var openBegin = 1;
                level++;
                while ( 1 ) {
                    var closeIndex = text.indexOf( close );
                    if ( closeIndex < 0 ) {
                        buf.push( level > 1 && openBegin ? open : '', text );
                        break;
                    }

                    level = greedy ? level - 1 : 0;
                    buf.push( 
                        level > 0 && openBegin ? open : '',
                        text.slice( 0, closeIndex ),
                        level > 0 ? close : ''
                    );
                    text = text.slice( closeIndex + closeLen );
                    openBegin = 0;

                    if ( level === 0 ) {
                        break;
                    }
                }

                if ( level === 0 ) {
                    onInBlock( buf.join( '' ) );
                    onOutBlock( text );
                    buf = [];
                }
            }
            else {
                text && onOutBlock( text );
            }
        }

        if ( level > 0 && buf.length > 0 ) {
            onOutBlock( open );
            onOutBlock( buf.join( '' ) );
        }
    }

    /**
     * 编译变量访问和变量替换的代码
     * 用于普通文本或if、var、filter等命令生成编译代码
     * 
     * @inner
     * @param {string} source 源代码
     * @param {Engine} engine 引擎实例
     * @param {boolean} forText 是否为输出文本的变量替换
     * @return {string}
     */
    function compileVariable( source, engine, forText ) {
        var code = [];
        var options = engine.options;

        var toStringHead = '';
        var toStringFoot = '';
        var wrapHead = '';
        var wrapFoot = '';

        // 默认的filter，当forText模式时有效
        var defaultFilter;

        if ( forText ) {
            toStringHead = 'ts(';
            toStringFoot = ')';
            wrapHead = RENDER_STRING_ADD_START;
            wrapFoot = RENDER_STRING_ADD_END;
            defaultFilter = options.defaultFilter
        }

        parseTextBlock(
            source, options.variableOpen, options.variableClose, 1,

            function ( text ) {
                // 加入默认filter
                // 只有当处理forText时，需要加入默认filter
                // 处理if/var/use等command时，不需要加入默认filter
                if ( forText && text.indexOf( '|' ) < 0 && defaultFilter ) {
                    text += '|' + defaultFilter;
                }

                // variableCode是一个gv调用，然后通过循环，在外面包filter的调用
                // 形成filter["b"](filter["a"](gv(...)))
                // 
                // 当forText模式，处理的是文本中的变量替换时
                // 传递给filter的需要是字符串形式，所以gv外需要包一层ts调用
                // 形成filter["b"](filter["a"](ts(gv(...))))
                // 
                // 当variableName以*起始时，忽略ts调用，直接传递原值给filter
                var filterCharIndex = text.indexOf( '|' );
                var variableName = (filterCharIndex > 0
                    ? text.slice( 0, filterCharIndex )
                    : text).replace( /^\s+/, '' ).replace( /\s+$/, '' );
                var filterSource = filterCharIndex > 0
                    ? text.slice( filterCharIndex + 1 )
                    : '';

                var variableRawValue = variableName.indexOf( '*' ) === 0;
                var variableCode = [
                    variableRawValue ? '' : toStringHead,
                    toGetVariableLiteral( variableName ),
                    variableRawValue ? '' : toStringFoot
                ];

                if ( filterSource ) {
                    filterSource = compileVariable( filterSource, engine );
                    var filterSegs = filterSource.split( '|' );
                    for ( var i = 0, len = filterSegs.length; i < len; i++ ) {
                        var seg = filterSegs[ i ];

                        if ( /^\s*([a-z0-9_-]+)(\((.*)\))?\s*$/i.test( seg ) ) {
                            variableCode.unshift( 'fs["' + RegExp.$1 + '"](' );

                            if ( RegExp.$3 ) {
                                variableCode.push( 
                                    ',', 
                                    RegExp.$3
                                );
                            }

                            variableCode.push( ')' );
                        }
                    }
                }

                code.push(
                    wrapHead,
                    variableCode.join( '' ),
                    wrapFoot
                );
            },

            function ( text ) { 
                code.push( 
                    wrapHead, 
                    forText ? stringLiteralize( text ) : text, 
                    wrapFoot
                );
            }
        );

        return code.join( '' );
    }

    /**
     * 文本节点类
     * 
     * @inner
     * @constructor
     * @param {string} value 文本节点的内容文本
     * @param {Engine} engine 引擎实例
     */
    function TextNode( value, engine ) {
        this.value = value;
        this.engine = engine;
    }
    
    TextNode.prototype = {
        /**
         * 获取renderer body的生成代码
         * 
         * @return {string}
         */
        getRendererBody: function () {
            var value = this.value;
            var options = this.engine.options;

            if ( !value || ( options.strip && /^\s*$/.test( value ) ) ) {
                return '';
            }

            return compileVariable( value, this.engine, 1 );
        },

        /**
         * 获取内容
         * 
         * @return {string}
         */
        getContent: function () {
            return this.value;
        }
    };

    /**
     * 命令节点类
     * 
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function Command( value, engine ) {
        this.value = value;
        this.engine = engine;
        this.children = [];
    }

    Command.prototype = {
        /**
         * 添加子节点
         * 
         * @param {TextNode|Command} node 子节点
         */
        addChild: function ( node ) {
            this.children.push( node );
        },

        /**
         * 节点open，解析开始
         * 
         * @param {Object} context 语法分析环境对象
         */
        open: function ( context ) {
            var parent = context.stack.top();
            this.parent = parent;
            parent && parent.addChild( this );
            context.stack.push( this );
        },

        /**
         * 节点闭合，解析结束
         * 
         * @param {Object} context 语法分析环境对象
         */
        close: function ( context ) {
            while (context.stack.pop().constructor !== this.constructor) {}
        },

        /**
         * 添加文本节点
         * 
         * @param {TextNode} node 节点
         */
        addTextNode: function ( node ) {
            this.addChild( node );
        },

        /**
         * 获取renderer body的生成代码
         * 
         * @return {string}
         */
        getRendererBody: function () {
            var buf = [];
            var children = this.children;
            for ( var i = 0; i < children.length; i++ ) {
                buf.push( children[ i ].getRendererBody() );
            }

            return buf.join( '' );
        }
    };

    /**
     * 命令自动闭合
     * 
     * @inner
     * @param {Object} context 语法分析环境对象
     * @param {Function=} CommandType 自闭合的节点类型
     */
    function autoCloseCommand( context, CommandType ) {
        var stack = context.stack;
        var closeEnd = CommandType 
            ? stack.find( function ( item ) {
                return item instanceof CommandType;
            } ) 
            : stack.bottom();

        if ( closeEnd ) {
            var node;

            do {
                node = stack.top();

                // 如果节点对象不包含autoClose方法
                // 则认为该节点不支持自动闭合，需要抛出错误
                // for等节点不支持自动闭合
                if ( !node.autoClose ) {
                    throw new Error( node.type + ' must be closed manually: ' + node.value );
                }
                node.autoClose( context );
            } while ( node !== closeEnd );
        }

        return closeEnd;
    }

    /**
     * renderer body起始代码段
     * 
     * @inner
     * @const
     * @type {string}
     */
    var RENDERER_BODY_START = ''
        + 'data=data||{};'
        + 'var v={},fs=engine.filters,hg=typeof data.get=="function",'
        + 'gv=function(n,ps){'
        +     'var p=ps[0],d=v[p];'
        +     'if(d==null){'
        +         'if(hg){return data.get(n);}'
        +         'd=data[p];'
        +     '}'
        +     'for(var i=1,l=ps.length;i<l;i++)if(d!=null)d = d[ps[i]];'
        +     'return d;'
        + '},'
        + 'ts=function(s){'
        +     'if(typeof s==="string"){return s;}'
        +     'if(s==null){s="";}'
        +     'return ""+s;'
        + '};'
    ;
    // v: variables
    // fs: filters
    // gv: getVariable
    // ts: toString
    // n: name
    // ps: properties
    // hg: hasGetter

    /**
     * Target命令节点类
     * 
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function TargetCommand( value, engine ) {
        if ( !/^\s*([a-z0-9_-]+)\s*(\(\s*master\s*=\s*([a-z0-9_-]+)\s*\))?\s*/i.test( value ) ) {
            throw new Error( 'Invalid ' + this.type + ' syntax: ' + value );
        }
        
        this.master = RegExp.$3;
        this.name = RegExp.$1;
        Command.call( this, value, engine );
        this.contents = {};
    }

    // 创建Target命令节点继承关系
    inherits( TargetCommand, Command );

    /**
     * Master命令节点类
     * 
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function MasterCommand( value, engine ) {
        if ( !/^\s*([a-z0-9_-]+)\s*(\(\s*master\s*=\s*([a-z0-9_-]+)\s*\))?\s*/i.test( value ) ) {
            throw new Error( 'Invalid ' + this.type + ' syntax: ' + value );
        }
        
        this.master = RegExp.$3;
        this.name = RegExp.$1;
        Command.call( this, value, engine );
        this.contents = {};
    }

    // 创建Master命令节点继承关系
    inherits( MasterCommand, Command );

    /**
     * Content命令节点类
     * 
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ContentCommand( value, engine ) {
        if ( !/^\s*([a-z0-9_-]+)\s*$/i.test( value ) ) {
            throw new Error( 'Invalid ' + this.type + ' syntax: ' + value );
        }

        this.name = RegExp.$1;
        Command.call( this, value, engine );
    }

    // 创建Content命令节点继承关系
    inherits( ContentCommand, Command );

    /**
     * ContentPlaceHolder命令节点类
     * 
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ContentPlaceHolderCommand( value, engine ) {
        if ( !/^\s*([a-z0-9_-]+)\s*$/i.test( value ) ) {
            throw new Error( 'Invalid ' + this.type + ' syntax: ' + value );
        }

        this.name = RegExp.$1;
        Command.call( this, value, engine );
    }

    // 创建ContentPlaceHolder命令节点继承关系
    inherits( ContentPlaceHolderCommand, Command );
    
    /**
     * Import命令节点类
     * 
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ImportCommand( value, engine ) {
        if ( !/^\s*([a-z0-9_-]+)\s*$/i.test( value ) ) {
            throw new Error( 'Invalid ' + this.type + ' syntax: ' + value );
        }

        this.name = RegExp.$1;
        Command.call( this, value, engine );
    }

    // 创建Import命令节点继承关系
    inherits( ImportCommand, Command );

    /**
     * Var命令节点类
     * 
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function VarCommand( value, engine ) {
        if ( !/^\s*([a-z0-9_]+)\s*=([\s\S]*)$/i.test( value ) ) {
            throw new Error( 'Invalid ' + this.type + ' syntax: ' + value );
        }

        this.name = RegExp.$1;
        this.expr = RegExp.$2;
        Command.call( this, value, engine );
    }

    // 创建Var命令节点继承关系
    inherits( VarCommand, Command );

    /**
     * filter命令节点类
     * 
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function FilterCommand( value, engine ) {
        if ( !/^\s*([a-z0-9_-]+)\s*(\(([\s\S]*)\))?\s*$/i.test( value ) ) {
            throw new Error( 'Invalid ' + this.type + ' syntax: ' + value );
        }

        this.name = RegExp.$1;
        this.args = RegExp.$3;
        Command.call( this, value, engine );
    }

    // 创建filter命令节点继承关系
    inherits( FilterCommand, Command );

    /**
     * Use命令节点类
     * 
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function UseCommand( value, engine ) {
        if ( !/^\s*([a-z0-9_-]+)\s*(\(([\s\S]*)\))?\s*$/i.test( value ) ) {
            throw new Error( 'Invalid ' + this.type + ' syntax: ' + value );
        }

        this.name = RegExp.$1;
        this.args = RegExp.$3;
        Command.call( this, value, engine );
    }

    // 创建Use命令节点继承关系
    inherits( UseCommand, Command );

    /**
     * for命令节点类
     * 
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ForCommand( value, engine ) {
        if ( !/^\s*(\$\{[\s\S]+\})\s+as\s+\$\{([0-9a-z_]+)\}\s*(,\s*\$\{([0-9a-z_]+)\})?\s*$/i.test( value ) ) {
            throw new Error( 'Invalid ' + this.type + ' syntax: ' + value );
        }
        
        this.list = RegExp.$1;
        this.item = RegExp.$2;
        this.index = RegExp.$4;
        Command.call( this, value, engine );
    }

    // 创建for命令节点继承关系
    inherits( ForCommand, Command );
    
    /**
     * if命令节点类
     * 
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function IfCommand( value, engine ) {
        Command.call( this, value, engine );
    }

    // 创建if命令节点继承关系
    inherits( IfCommand, Command );

    /**
     * elif命令节点类
     * 
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ElifCommand( value, engine ) {
        IfCommand.call( this, value, engine );
    }

    // 创建elif命令节点继承关系
    inherits( ElifCommand, IfCommand );

    /**
     * else命令节点类
     * 
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ElseCommand( value, engine ) {
        Command.call( this, value, engine );
    }

    // 创建else命令节点继承关系
    inherits( ElseCommand, Command ); 
    
    /**
     * Target和Master的节点状态
     * 
     * @inner
     */
    var TMNodeState = {
        READING: 1,
        READED: 2,
        APPLIED: 3,
        READY: 4
    };

    /**
     * 节点闭合，解析结束
     * 
     * @param {Object} context 语法分析环境对象
     */
    MasterCommand.prototype.close =

    /**
     * 节点闭合，解析结束。自闭合时被调用
     * 
     * @param {Object} context 语法分析环境对象
     */
    MasterCommand.prototype.autoClose = 

    /**
     * 节点闭合，解析结束
     * 
     * @param {Object} context 语法分析环境对象
     */
    TargetCommand.prototype.close =

    /**
     * 节点闭合，解析结束。自闭合时被调用
     * 
     * @param {Object} context 语法分析环境对象
     */
    TargetCommand.prototype.autoClose = function ( context ) {
        Command.prototype.close.call( this, context );
        this.state = this.master ? TMNodeState.READED : TMNodeState.APPLIED;
        context.targetOrMaster = null;
    };

    /**
     * 应用其继承的母版，返回是否成功应用母版
     * 
     * @return {boolean}
     */
    TargetCommand.prototype.applyMaster = 

    /**
     * 应用其继承的母版，返回是否成功应用母版
     * 
     * @return {boolean}
     */
    MasterCommand.prototype.applyMaster = function () {
        if ( this.state >= TMNodeState.APPLIED ) {
            return 1;
        }

        var masterNode = this.engine.masters[ this.master ];
        if ( masterNode && masterNode.applyMaster() ) {
            this.children = [];

            for ( var i = 0, len = masterNode.children.length; i < len; i++ ) {
                var child = masterNode.children[ i ];

                if ( child instanceof ContentPlaceHolderCommand ) {
                    this.children.push.apply( 
                        this.children, 
                        (this.contents[ child.name ] || child).children
                    );
                }
                else {
                    this.children.push( child );
                }
            }

            this.state = TMNodeState.APPLIED;
            return 1;
        }
    };

    /**
     * 判断target是否ready
     * 包括是否成功应用母版，以及import和use语句依赖的target是否ready
     * 
     * @return {boolean}
     */
    TargetCommand.prototype.isReady = function () {
        if ( this.state >= TMNodeState.READY ) {
            return 1;
        }

        var engine = this.engine;
        var readyState = 1;

        /**
         * 递归检查节点的ready状态
         * 
         * @inner
         * @param {Command|TextNode} node 目标节点
         */
        function checkReadyState( node ) {
            for ( var i = 0, len = node.children.length; i < len; i++ ) {
                var child = node.children[ i ];
                if ( child instanceof ImportCommand ) {
                    var target = engine.targets[ child.name ];
                    readyState = readyState 
                        && target && target.isReady( engine );
                }
                else if ( child instanceof Command ) {
                    checkReadyState( child );
                }
            }
        }

        if ( this.applyMaster() ) {
            checkReadyState( this );
            readyState && (this.state = TMNodeState.READY);
            return readyState;
        }
    };

    /**
     * 获取target的renderer函数
     * 
     * @return {function(Object):string}
     */
    TargetCommand.prototype.getRenderer = function () {
        if ( this.renderer ) {
            return this.renderer;
        }

        if ( this.isReady() ) {
            // console.log( this.name + ' ------------------' );
            // console.log(RENDERER_BODY_START +RENDER_STRING_DECLATION
            //     + this.getRendererBody() 
            //     + RENDER_STRING_RETURN);

            var realRenderer = new Function( 
                'data', 'engine',
                [
                    RENDERER_BODY_START,
                    RENDER_STRING_DECLATION,
                    this.getRendererBody(),
                    RENDER_STRING_RETURN
                ].join( '\n' )
            );

            var engine = this.engine;
            this.renderer = function ( data ) {
                return realRenderer( data, engine );
            };

            return this.renderer;
        }

        return null;
    };

    /**
     * 获取内容
     * 
     * @return {string}
     */
    TargetCommand.prototype.getContent = function () {
        if ( this.isReady() ) {
            var buf = [];
            var children = this.children;
            for ( var i = 0; i < children.length; i++ ) {
                buf.push( children[ i ].getContent() );
            }

            return buf.join( '' );
        }

        return '';
    };

    /**
     * 将target或master节点对象添加到语法分析环境中
     * 
     * @inner
     * @param {TargetCommand|MasterCommand} targetOrMaster target或master节点对象
     * @param {Object} context 语法分析环境对象
     */
    function addTargetOrMasterToContext( targetOrMaster, context ) {
        context.targetOrMaster = targetOrMaster;

        var engine = context.engine;
        var name = targetOrMaster.name;
        var isTarget = targetOrMaster instanceof TargetCommand;
        var prop = isTarget ? 'targets' : 'masters';

        if ( engine[ prop ][ name ] ) {
            switch ( engine.options.namingConflict ) {
                case 'override':
                    engine[ prop ][ name ] = targetOrMaster;
                    isTarget && context.targets.push( name );
                case 'ignore':
                    break;
                default:
                    throw new Error( ( isTarget ? 'Target' :'Master' ) 
                        + ' is exists: ' + name );
            }
        }
        else {
            engine[ prop ][ name ] = targetOrMaster;
            isTarget && context.targets.push( name );
        }
    }

    /**
     * target节点open，解析开始
     * 
     * @param {Object} context 语法分析环境对象
     */
    TargetCommand.prototype.open = 

    /**
     * master节点open，解析开始
     * 
     * @param {Object} context 语法分析环境对象
     */
    MasterCommand.prototype.open = function ( context ) {
        autoCloseCommand( context );
        Command.prototype.open.call( this, context );
        this.state = TMNodeState.READING;
        addTargetOrMasterToContext( this, context );
    };

    /**
     * Import节点open，解析开始
     * 
     * @param {Object} context 语法分析环境对象
     */
    ImportCommand.prototype.open = 

    /**
     * Var节点open，解析开始
     * 
     * @param {Object} context 语法分析环境对象
     */
    VarCommand.prototype.open = 

    /**
     * Use节点open，解析开始
     * 
     * @param {Object} context 语法分析环境对象
     */
    UseCommand.prototype.open = function ( context ) {
        var parent = context.stack.top();
        this.parent = parent;
        parent.addChild( this );
    };


    /**
     * 节点open前的处理动作：节点不在target中时，自动创建匿名target
     * 
     * @param {Object} context 语法分析环境对象
     */
    UseCommand.prototype.beforeOpen = 

    /**
     * 节点open前的处理动作：节点不在target中时，自动创建匿名target
     * 
     * @param {Object} context 语法分析环境对象
     */
    ImportCommand.prototype.beforeOpen = 

    /**
     * 节点open前的处理动作：节点不在target中时，自动创建匿名target
     * 
     * @param {Object} context 语法分析环境对象
     */
    VarCommand.prototype.beforeOpen = 

    /**
     * 节点open前的处理动作：节点不在target中时，自动创建匿名target
     * 
     * @param {Object} context 语法分析环境对象
     */
    ForCommand.prototype.beforeOpen = 

    /**
     * 节点open前的处理动作：节点不在target中时，自动创建匿名target
     * 
     * @param {Object} context 语法分析环境对象
     */
    FilterCommand.prototype.beforeOpen = 

    /**
     * 节点open前的处理动作：节点不在target中时，自动创建匿名target
     * 
     * @param {Object} context 语法分析环境对象
     */
    IfCommand.prototype.beforeOpen = 

    /**
     * 文本节点被添加到分析环境前的处理动作：节点不在target中时，自动创建匿名target
     * 
     * @param {Object} context 语法分析环境对象
     */
    TextNode.prototype.beforeAdd =  function ( context ) {
        if ( context.stack.bottom() ) {
            return;
        }

        var target = new TargetCommand( generateGUID(), context.engine );
        target.open( context );
    };
    
    /**
     * 节点解析结束
     * 由于use节点无需闭合，处理时不会入栈，所以将close置为空函数
     * 
     * @param {Object} context 语法分析环境对象
     */
    UseCommand.prototype.close = 

    /**
     * 节点解析结束
     * 由于import节点无需闭合，处理时不会入栈，所以将close置为空函数
     * 
     * @param {Object} context 语法分析环境对象
     */ 
    ImportCommand.prototype.close = 

    /**
     * 节点解析结束
     * 由于else节点无需闭合，处理时不会入栈，闭合由if负责。所以将close置为空函数
     * 
     * @param {Object} context 语法分析环境对象
     */
    ElseCommand.prototype.close = 

    /**
     * 节点解析结束
     * 由于var节点无需闭合，处理时不会入栈，所以将close置为空函数
     * 
     * @param {Object} context 语法分析环境对象
     */
    VarCommand.prototype.close = function () {};

    /**
     * 获取内容
     * 
     * @return {string}
     */
    ImportCommand.prototype.getContent = function () {
        var target = this.engine.targets[ this.name ];
        return target.getContent();
    };
    
    /**
     * 获取renderer body的生成代码
     * 
     * @return {string}
     */
    ImportCommand.prototype.getRendererBody = function () {
        var target = this.engine.targets[ this.name ];
        return target.getRendererBody();
    };

    /**
     * 获取renderer body的生成代码
     * 
     * @return {string}
     */
    UseCommand.prototype.getRendererBody = function () {
        return stringFormat(
            '{0}engine.render({2},{{3}}){1}',
            RENDER_STRING_ADD_START,
            RENDER_STRING_ADD_END,
            stringLiteralize( this.name ),
            compileVariable( this.args, this.engine ).replace( 
                /(^|,)\s*([a-z0-9_]+)\s*=/ig,
                function ( match, start, argName ) {
                    return (start || '') + stringLiteralize( argName ) + ':';
                }
            )
        );
    };
    
    /**
     * 获取renderer body的生成代码
     * 
     * @return {string}
     */
    VarCommand.prototype.getRendererBody = function () {
        if ( this.expr ) {
            return stringFormat( 
                'v[{0}]={1};',
                stringLiteralize( this.name ),
                compileVariable( this.expr, this.engine )
            );
        }

        return '';
    };

    /**
     * 获取renderer body的生成代码
     * 
     * @return {string}
     */
    IfCommand.prototype.getRendererBody = function () {
        var rendererBody = stringFormat(
            'if({0}){{1}}',
            compileVariable( this.value, this.engine ),
            Command.prototype.getRendererBody.call( this )
        );

        var elseCommand = this[ 'else' ];
        if ( elseCommand ) {
            return [
                rendererBody,
                stringFormat( 
                    'else{{0}}',
                    elseCommand.getRendererBody()
                )
            ].join( '' );
        }

        return rendererBody;
    };

    /**
     * 获取renderer body的生成代码
     * 
     * @return {string}
     */
    ForCommand.prototype.getRendererBody = function () {
        return stringFormat(
            ''
            + 'var {0}={1};'
            + 'if({0} instanceof Array)'
            +     'for (var {4}=0,{5}={0}.length;{4}<{5};{4}++){v[{2}]={4};v[{3}]={0}[{4}];{6}}'
            + 'else if(typeof {0}==="object")'
            +     'for(var {4} in {0}){v[{2}]={4};v[{3}]={0}[{4}];{6}}',
            generateGUID(),
            compileVariable( this.list, this.engine ),
            stringLiteralize( this.index || generateGUID() ),
            stringLiteralize( this.item ),
            generateGUID(),
            generateGUID(),
            Command.prototype.getRendererBody.call( this )
        );
    };

    /**
     * 获取renderer body的生成代码
     * 
     * @return {string}
     */
    FilterCommand.prototype.getRendererBody = function () {
        var args = this.args;
        return stringFormat(
            '{2}fs[{5}]((function(){{0}{4}{1}})(){6}){3}',
            RENDER_STRING_DECLATION,
            RENDER_STRING_RETURN,
            RENDER_STRING_ADD_START,
            RENDER_STRING_ADD_END,
            Command.prototype.getRendererBody.call( this ),
            stringLiteralize( this.name ),
            args ? ',' + compileVariable( args, this.engine ) : ''
        );
    };

    /**
     * content节点open，解析开始
     * 
     * @param {Object} context 语法分析环境对象
     */
    ContentCommand.prototype.open = function ( context ) {
        autoCloseCommand( context, ContentCommand );
        Command.prototype.open.call( this, context );
        context.targetOrMaster.contents[ this.name ] = this;
    };
    
    /**
     * content节点open，解析开始
     * 
     * @param {Object} context 语法分析环境对象
     */
    ContentPlaceHolderCommand.prototype.open = function ( context ) {
        autoCloseCommand( context, ContentPlaceHolderCommand );
        Command.prototype.open.call( this, context );
    };

    /**
     * 节点自动闭合，解析结束
     * 
     * @param {Object} context 语法分析环境对象
     */
    ContentCommand.prototype.autoClose = 

    /**
     * 节点自动闭合，解析结束
     * 
     * @param {Object} context 语法分析环境对象
     */
    IfCommand.prototype.autoClose = Command.prototype.close;

    /**
     * 节点自动闭合，解析结束
     * contentplaceholder的自动结束逻辑为，在其开始位置后马上结束
     * 所以，其自动结束时children应赋予其所属的parent，也就是master
     * 
     * @param {Object} context 语法分析环境对象
     */
    ContentPlaceHolderCommand.prototype.autoClose = function ( context ) {
        var parentChildren = this.parent.children;
        parentChildren.push.apply( parentChildren, this.children );
        this.children.length = 0;
        this.close( context );
    };
    
    /**
     * 添加子节点
     * 
     * @param {TextNode|Command} node 子节点
     */
    IfCommand.prototype.addChild = function ( node ) {
        var elseCommand = this[ 'else' ];
        ( elseCommand 
            ? elseCommand.children 
            : this.children
        ).push( node );
    };

    /**
     * elif节点open，解析开始
     * 
     * @param {Object} context 语法分析环境对象
     */
    ElifCommand.prototype.open = function ( context ) {
        var elseCommand = new ElseCommand();
        elseCommand.open( context );

        var ifCommand = autoCloseCommand( context, IfCommand );
        ifCommand.addChild( this );
        context.stack.push( this );
    };

    /**
     * else节点open，解析开始
     * 
     * @param {Object} context 语法分析环境对象
     */
    ElseCommand.prototype.open = function ( context ) {
        var ifCommand = autoCloseCommand( context, IfCommand );
        
        ifCommand[ 'else' ] = this;
        context.stack.push( ifCommand );
    };
    
    /**
     * 命令类型集合
     * 
     * @type {Object}
     */
    var commandTypes = {};

    /**
     * 添加命令类型
     * 
     * @inner
     * @param {string} name 命令名称
     * @param {Function} Type 处理命令用到的类
     */
    function addCommandType( name, Type ) {
        commandTypes[ name ] = Type;
        Type.prototype.type = name;
    }

    addCommandType( 'target', TargetCommand );
    addCommandType( 'master', MasterCommand );
    addCommandType( 'content', ContentCommand );
    addCommandType( 'contentplaceholder', ContentPlaceHolderCommand );
    addCommandType( 'import', ImportCommand );
    addCommandType( 'use', UseCommand );
    addCommandType( 'var', VarCommand );
    addCommandType( 'for', ForCommand );
    addCommandType( 'if', IfCommand );
    addCommandType( 'elif', ElifCommand );
    addCommandType( 'else', ElseCommand );
    addCommandType( 'filter', FilterCommand );
    
    
    /**
     * etpl引擎类
     * 
     * @constructor
     * @param {Object=} options 引擎参数
     * @param {string=} options.commandOpen 命令语法起始串
     * @param {string=} options.commandClose 命令语法结束串
     * @param {string=} options.defaultFilter 默认变量替换的filter
     * @param {boolean=} options.strip 是否清除命令标签前后的空白字符
     * @param {string=} options.namingConflict target或master名字冲突时的处理策略
     */
    function Engine( options ) {
        this.options = {
            commandOpen: '<!--',
            commandClose: '-->',
            variableOpen: '${',
            variableClose: '}',
            defaultFilter: 'html'
        };

        this.config( options );
        this.masters = {};
        this.targets = {};
        this.filters = extend({}, DEFAULT_FILTERS);
    }

    /**
     * 配置引擎参数，设置的参数将被合并到现有参数中
     * 
     * @param {Object} options 参数对象
     * @param {string=} options.commandOpen 命令语法起始串
     * @param {string=} options.commandClose 命令语法结束串
     * @param {string=} options.defaultFilter 默认变量替换的filter
     * @param {boolean=} options.strip 是否清除命令标签前后的空白字符
     * @param {string=} options.namingConflict target或master名字冲突时的处理策略
     */
    Engine.prototype.config =  function ( options ) {
        extend( this.options, options );
    };

    /**
     * 解析模板并编译，返回第一个target编译后的renderer函数。
     * 
     * @param {string} source 模板源代码
     * @return {function(Object):string}
     */
    Engine.prototype.compile = 

    /**
     * 解析模板并编译，返回第一个target编译后的renderer函数。
     * 该方法的存在为了兼容老模板引擎
     * 
     * @param {string} source 模板源代码
     * @return {function(Object):string}
     */
    Engine.prototype.parse = function ( source ) {
        if ( source ) {
            var targetNames = parseSource( source, this );
            if ( targetNames.length ) {
                return this.targets[ targetNames[ 0 ] ].getRenderer();
            }
        }

        return new Function('return ""');
    };
    
    /**
     * 根据target名称获取编译后的renderer函数
     * 
     * @param {string} name target名称
     * @return {function(Object):string}
     */
    Engine.prototype.getRenderer = function ( name ) {
        var target = this.targets[ name ];
        if ( target ) {
            return target.getRenderer();
        }
    };

    /**
     * 根据target名称获取模板内容
     * 
     * @param {string} name target名称
     * @return {string}
     */
    Engine.prototype.get = function ( name ) {
        var target = this.targets[ name ];
        if ( target ) {
            return target.getContent();
        }

        return '';
    };

    /**
     * 执行模板渲染，返回渲染后的字符串。
     * 
     * @param {string} name target名称
     * @param {Object=} data 模板数据。
     *      可以是plain object，
     *      也可以是带有 {string}get({string}name) 方法的对象
     * @return {string}
     */
    Engine.prototype.render = function ( name, data ) {
        var renderer = this.getRenderer( name );
        if ( renderer ) {
            return renderer( data );
        }

        return '';
    };

    /**
     * 增加过滤器
     * 
     * @param {string} name 过滤器名称
     * @param {Function} filter 过滤函数
     */
    Engine.prototype.addFilter = function ( name, filter ) {
        if ( typeof filter == 'function' ) {
            this.filters[ name ] = filter;
        }
    };

    /**
     * 解析源代码
     * 
     * @inner
     * @param {string} source 模板源代码
     * @param {Engine} engine 引擎实例
     * @return {Array} target名称列表
     */
    function parseSource( source, engine ) {
        var commandOpen = engine.options.commandOpen;
        var commandClose = engine.options.commandClose;

        var stack = new Stack();
        var analyseContext = {
            engine: engine,
            targets: [],
            stack: stack
        };

        // text节点内容缓冲区，用于合并多text
        var textBuf = [];

        /**
         * 将缓冲区中的text节点内容写入
         *
         * @inner
         */
        function flushTextBuf() {
            if ( textBuf.length > 0 ) {
                var text = textBuf.join( '' );
                var textNode = new TextNode( text, engine );
                textNode.beforeAdd( analyseContext );

                stack.top().addTextNode( textNode );
                textBuf = [];

                if ( engine.options.strip 
                    && analyseContext.current instanceof Command 
                ) {
                    textNode.value = text.replace( /^[\x20\t\r]*\n/, '' );
                }
                analyseContext.current = textNode;
            }
        }

        var NodeType;

        /**
         * 判断节点是否是NodeType类型的实例
         * 用于在stack中find提供filter
         * 
         * @inner
         * @param {Command} node 目标节点
         * @return {boolean}
         */
        function isInstanceofNodeType( node ) {
            return node instanceof NodeType;
        }

        parseTextBlock(
            source, commandOpen, commandClose, 0,

            function ( text ) { // <!--...-->内文本的处理函数
                var match = /^\s*(\/)?([a-z]+)\s*(:([\s\S]*))?$/.exec( text );

                // 符合command规则，并且存在相应的Command类，说明是合法有含义的Command
                // 否则，为不具有command含义的普通文本
                if ( match 
                    && ( NodeType = commandTypes[ match[2].toLowerCase() ] )
                    && typeof NodeType == 'function'
                ) {
                    // 先将缓冲区中的text节点内容写入
                    flushTextBuf(); 

                    var currentNode = analyseContext.current;
                    if ( engine.options.strip && currentNode instanceof TextNode ) {
                        currentNode.value = currentNode.value
                            .replace( /\r?\n[\x20\t]*$/, '\n' );
                    }

                    if ( match[1] ) {
                        currentNode = stack.find( isInstanceofNodeType );
                        currentNode && currentNode.close( analyseContext );
                    }
                    else {
                        currentNode = new NodeType( match[4], engine );
                        if ( typeof currentNode.beforeOpen == 'function' ) {
                            currentNode.beforeOpen( analyseContext );
                        }
                        currentNode.open( analyseContext );
                    }

                    analyseContext.current = currentNode;
                }
                else if ( !/^\s*\/\//.test( text ) ) {
                    // 如果不是模板注释，则作为普通文本，写入缓冲区
                    textBuf.push( commandOpen, text, commandClose );
                }

                NodeType = null;
            },

            function ( text ) { // <!--...-->外，普通文本的处理函数
                // 普通文本直接写入缓冲区
                textBuf.push( text );
            }
        );


        flushTextBuf(); // 将缓冲区中的text节点内容写入
        autoCloseCommand( analyseContext );

        return analyseContext.targets;
    }

    var etpl = new Engine();
    etpl.Engine = Engine;
    
    if ( typeof exports == 'object' && typeof module == 'object' ) {
        // For CommonJS
        exports = module.exports = etpl;
    }
    else if ( typeof define == 'function' && define.amd ) {
        // For AMD
        define( etpl );
    }
    else {
        // For <script src="..."
        root.etpl = etpl;
    }
})(this);
