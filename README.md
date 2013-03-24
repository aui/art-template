# artTemplate
=================

> [artTemplate](https://github.com/aui/artTemplate) 是新一代 javascript 模板引擎，它在 v8 中的渲染效率可接近 javascript 性能极限，在 chrome 下[渲染效率测试](http://aui.github.com/artTemplate/test/test-speed.html)中分别是知名引擎 Mustache 与 micro tmpl 的 25 、 32 倍。

> 引擎支持调试。若渲染中遇到错误，调试器可精确定位到产生异常的模板语句，解决前端模板难以调试的问题。

> 提供模板编译工具，可以把模板编译成不依赖引擎的js文件，并且支持``include``语句，这样前端模板可以像后端模板一样按文件存放、按需加载，编译后的js文件支持RequireJS、SeaJS的合并工具。

> 这一切都在 2kb(gzip) 中实现！


## 快速上手

### 编写模板

使用一个``type="text/html"``的``script``标签存放模板：
	
	<script id="test" type="text/html">
	<h1><%=title%></h1>
	<ul>
    	<%for(i = 0; i < list.length; i ++) {%>
        	<li>条目内容 <%=i + 1%> ：<%=list[i]%></li>
    	<%}%>
	</ul>
	</script>
	
模板逻辑语法开始与结束的界定符号为``<%`` 与``%>``，若``<%``后面紧跟``=``号则输出变量内容。

### 渲染模板
	
	var data = {
		title: '标签',
		list: ['文艺', '博客', '摄影', '电影', '民谣', '旅行', '吉他']
	};
	var html = template.render('test', data);
	document.getElementById('content').innerHTML = html;


[演示](http://aui.github.com/artTemplate/demo/basic.html)

## 嵌入子模板

使用``<%include(id, [data])%>``可以嵌入子模板，其中第二个参数是可选的，它默认传入当前的数据。

	<script id="test" type="text/html">
	<h1><%=title%></h1>
	<%include('list')%>
	</script>
	
	<script id="list" type="text/html">
	<ul>
    	<%for(i = 0; i < list.length; i ++) {%>
        	<li>条目内容 <%=i + 1%> ：<%=list[i]%></li>
    	<%}%>
	</ul>
	</script>
	
[演示](http://aui.github.com/artTemplate/demo/include.html)

## 不转义HTML

模板引擎默认数据包含的HTML字符进行转义以避免XSS漏洞，若不需要转义的地方可使用两个``=``号。

	<script id="test" type="text/html">
	<%==value%>
	</script>
	
若需要关闭默认转义，可以设置``template.isEscape = false``。

[演示](http://aui.github.com/artTemplate/demo/no-escape.html)

## 在js中存放模板

``template.compile([id], source)``将返回一个渲染函数。其中id参数是可选的，如果使用了id参数，可以使用``template.render(id, data)``渲染模板。

	var source =
	  '<ul>'
	+    '<% for (var i = 0; i < list.length; i ++) { %>'
	+        '<li>索引 <%= i + 1 %> ：<%= list[i] %></li>'
	+    '<% } %>'
	+ '</ul>';
	
	var data = {
	    list: ['文艺', '博客', '摄影', '电影', '民谣', '旅行', '吉他']
	};
	
	var render = template.compile(source);
	var html = render(data);
	document.getElementById('content').innerHTML = html;
	
[演示](http://aui.github.com/artTemplate/demo/compile.html)

## 添加辅助方法

``template.helper(name, callback)``辅助方法一般用来进行字符串替换，如XSS过滤、UBB替换、脏话替换等。

例如扩展一个UBB替换方法：

	template.helper('$ubb2html', function (content) {
    	return content
    	.replace(/\[b\]([^\[]*?)\[\/b\]/igm, '<b>$1</b>')
    	.replace(/\[i\]([^\[]*?)\[\/i\]/igm, '<i>$1</i>')
    	.replace(/\[u\]([^\[]*?)\[\/u\]/igm, '<u>$1</u>')
    	.replace(/\[url=([^\]]*)\]([^\[]*?)\[\/url\]/igm, '<a href="$1">$2</a>')
    	.replace(/\[img\]([^\[]*?)\[\/img\]/igm, '<img src="$1" />');
	});
	
在模板中的使用方式：

	<%=$ubb2html(content) %>
	
注意：引擎不会对辅助方法输出的HTML字符进行转义。
	
[演示](http://aui.github.com/artTemplate/demo/helper.html)

## 设置界定符

若前端模板语法与后端语法产生冲突，可以修改模板引擎界定符，例如：

	template.openTag = "<!--[";
	template.closeTag = "]-->";
	
[演示](http://aui.github.com/artTemplate/demo/tag.html)

## 自定义语法

artTemplate 提供一个语法扩展用来简化模板逻辑语法。语法示例：

	{if admin}
    	<h3>{title}</h3>
    	<ul>
    	    {each list}
            	<li>{$index + 1}: {$value}</li>
       		{/each}
    	</ul>
	{/if}
	
[文档](http://aui.github.com/artTemplate/extensions/index.html)

[演示](http://aui.github.com/artTemplate/demo/tag.html)

## 自动化工具

有时候考虑到模板复用或者需要异步加载，可以使用 tools 目录下的 combine.html，把 HTML 中的模板提取出来以便把模板嵌入到 js 文件中。

## 模板编码规范

1、不能使用 javascript 关键字作为模板变量(包括 ECMA5 严格模式下新增的关键字):

> break, case, catch, continue, debugger, default, delete, do, else, false, finally, for, function, if, in, instanceof, new, null, return, switch, this, throw, true, try, typeof, var, void, while, with, abstract, boolean, byte, char, class, const, double, enum, export, extends, final, float, goto, implements, import, int, interface, long, native, package, private, protected, public, short, static, super, synchronized, throws, transient, volatile, arguments, let, yield

2、模板禁止读写全局变量，除非给模板定义辅助方法。例如：

	template.helper('Math', Math)

> artTemplate编译后的模板将运行在沙箱内，模板语句无法读写外部对象。
> 
> 在使用原生语法的引擎中，模板中若引用外部对象，随着项目复杂度增加，那时候谁都不能确定模板中的变量到底是数据还是全局对象，这种复杂的依赖关系将为会项目带来巨大的维护成本。


## 更新记录

### v2.0

1.	对非String、Number类型的数据不输出，而Function类型求值后输出。
2.	默认对html进行转义输出，原文输出可使用``<%==value%>``，也可以关闭默认的转义功能``template.isEscape = false``。
3.	增加批处理工具支持把模板编译成不依赖模板引擎的js文件，可通过RequireJS、SeaJS等模块加载器进行异步加载。

## 授权协议

Released under the MIT, BSD, and GPL Licenses

============

[速度比赛](http://aui.github.com/artTemplate/test/test-speed.html) | [引擎原理](http://cdc.tencent.com/?p=5723)

© cdc.tencent.com
