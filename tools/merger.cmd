@if (0===0) @end/*
@echo off
call CScript.EXE "%~dpnx0" //Nologo //e:jscript %*
goto cmd
*//*!
 * Copyright (C) 2012 Tencent Inc.
 * Author  tangbin
 * Email   1987.tangbin@gmail.com
 */
 
var errorlevel = 0;

if (!Array.prototype.forEach) {

    Array.prototype.forEach =  function(block, thisObject) {
        var len = this.length >>> 0;
        
        for (var i = 0; i < len; i++) {
            if (i in this) {
                block.call(thisObject, this[i], i, this);
            }
        }
        
    };
    
}

if (!String.prototype.trim) {

    String.prototype.trim = (function () {
        var trimLeft = /^\s+/, trimRight = /\s+$/;
        
        return function () {
			return this == null ?
				'' :
				this.toString().replace(trimLeft, '').replace(trimRight, '');
        };
    })();
    
}

/** 模板合并 */
var merger = function (code) {
    
    //\sid=("|')([^"]+?)\1
    var rtmpl = /<script([^>]*?)>([\w\W]*?)<\/script>/ig;
    var rtype = /type=("|')text\/html\1/i;
    var rid = /id=("|')([^"]+?)\1/;
    
    var string = '';
    
    // 提取模板片段
    while ((val = rtmpl.exec(code)) !== null) {
        if (rtype.test(val[1])) {
            string += merger.compress(val[1].match(rid)[2], val[2]) + '\r\n';
        }
    }
    
    if (!string) {
        string = merger.compress('id', code);
    }
    
    return string;
};

merger.compress = function (id, code) {
    
    
    var openTag = '<%';
    var closeTag = '%>';
    
    if (typeof template !== 'undefined') {
        openTag = template.openTag;
        closeTag = template.closeTag
    }
    
    code = code
    // 去除 html 与 js 多行注释
    .replace(/\/\*[^\*\/]*\*\/|<!--.*?-->/g, '')
    // 去除多余制表符、TAB符、回车符
    .replace(/\n/g, '')
    .replace(/[\r\t]/g, ' ')
    // “\” 转义
    .replace(/\\/g, "\\\\")
    // “'” 转义
    .replace(/'/g, "\\'");
    
    
    // 语法分析
    var strings = '';
    code.split(openTag).forEach(function (text, i) {
        text = text.split(closeTag);
        
        var $0 = text[0];
        var $1 = text[1];
        
        // text: [html]
        if (text.length === 1) {
            
            strings += html($0);
         
        // text: [logic, html]
        } else {
                   
            strings += logic($0);    
            
            if ($1) {
                strings += html($1);
            }
        }
        

    });
    
    function html (text) {
        return text.replace(/\s+/g, ' ');
    };
    
    function logic (text) {
        return openTag + text.trim() + closeTag;
    };

    code = strings;
    
    
    // ANSI 转义
    var unicode = [], ansi;
    for (var i = 0 ; i < code.length; i ++) {
        ansi = code.charCodeAt(i);
        if (ansi > 255) {
            unicode.push('\\u' + ansi.toString(16));
        } else {
            unicode.push(code.charAt(i));
        } 
    }
    code = unicode.join('').trim();
    
    

	code = "template('" + id + "', '" + code + "');";
    
	return code;
};



/**
 * 文件操作
 * @see http://code.google.com/p/naturaljs/source/browse/common/component.js
 */
var file = {

    /** 
     * 打开文件，读取其内容，返回文本的格式。
     * @param	{String}	path		文件路径
     * @param	{String}	sCharset	指定字符集
     * @return	{Object} 	            文件内容
     */

    read: function (filename, sCharset) {
        var stream = new ActiveXObject('adodb.stream');
        var fileContent;

        with(stream) {
            type = 2; // 1－二进制，2－文本
            mode = 3; // 1－读，2－写，3－读写
            open();

            if (!sCharset) {
                try {
                    charset = "437"; // why try, cause some bug now
                } catch (e) {}
                loadFromFile(filename);

                // get the BOM(byte order mark) or escape(ReadText(2)) is fine?
                switch (escape(readText(2).replace(/\s/g, ''))) {
                case "%3Ca":
                case "%3Cd":
                case "%3C%3F":
                case "%u2229%u2557":
                    // 0xEF,0xBB => UTF-8
                    sCharset = "UTF-8";
                    break;
                case "%A0%u25A0":
                    // 0xFF,0xFE => Unicode
                case "%u25A0%A0":
                    // 0xFE,0xFF => Unicode big endian
                    sCharset = "Unicode";
                    break;
                default:
                    // 判断不出来就使用GBK，这样可以在大多数情况下正确处理中文
                    sCharset = "GBK";
                }
                close();
                open();
            }
            charset = sCharset;
            loadFromFile(filename);
            fileContent = new String(readText());
            fileContent.charset = sCharset;
            close();
        }
        return fileContent;
    }

    /**
     * 将数据保存到磁盘上。可支持文本数据和二进制数据。
     * @param 	{String} 	path 		文件路径。
     * @param 	{String} 	data 		要写入的数据，可以是二进制对象。
     * @param 	{Boolean} 	isBinary	是否为二进制数据。
     * @param 	{Boolean} 	isMapPath	是否送入相对路径。True 的话把虚拟路径还原为真实的磁盘路径。
     * @return 	{Boolean} 	True		表示操作成功。
     */
     ,write: function (path, data, isBinary, chartset) {
        with(new ActiveXObject("Adodb.Stream")) {
            type = isBinary ? 1 : 2;
            if (!chartset && !isBinary) {
                charset = "utf-8";
            }
            if (chartset) {
                charset = "GB2312";
            }
            try {
                open();
                if (!isBinary) {
                    writeText(data);
                } else {
                    write(data);
                }
                saveToFile(path, 2);

                return true;
            } catch (e) {
                throw e;
            } finally {
                close();
            }
        }

        return true;
    }

};



var Arguments = WScript.Arguments;
var path = Arguments.length && Arguments(0);

var list = [];
for (var i = 0, len = Arguments.length; i < len; i ++) {
    list.push(Arguments(i));
}

list.forEach(function (path, i) {
    var data = file.read(path);
    
	path = path.replace(/\\/g, '/').split('/');
    
    var name = path.pop().replace(/\.\w+$/, '');
	var newPath = (path.join('/').lastIndexOf('/') < 0 ? '.' : path.join('/'))
    + '/template-' + name + '.js';
    
    data = merger(data);
    
    var ret = file.write(newPath, data, false);
    
    if (!ret) {
        errorlevel = 1;
        WScript.Echo('错误: \r\n文件写入失败！' + newPath);
    }
});

if (!list.length) {
    errorlevel = 1;
    WScript.Echo('[使用帮助]'
    + '\r\n\r\n把含有内嵌模板的页面拖放到本程序文件图标上运行'
    + '\r\n\r\n程序会查找页面中含有 type="text/html" 脚本标签，打包合并为外部 js 文件如：'
    + '\r\n\r\n<script id="demo" type="text/html">'
    + '\r\n    [template code..]'
    + '\r\n</script>');
}


WScript.Quit(errorlevel);

/*-----------------------------------------------*//*
:cmd
if %errorlevel% == 0 exit
pause>nul
*/