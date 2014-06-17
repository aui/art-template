# artTemplate 原生 js 模板语法版

## 使用

在页面中引用模板引擎：

    <script src="dist/template-native.js"></script>
    
[下载](https://raw.github.com/aui/artTemplate/master/dist/template-native.js)

## 表达式

``<%`` 与 ``%>`` 符号包裹起来的语句则为模板的逻辑表达式。

### 输出表达式

对内容编码输出：

    <%=content%>

不编码输出：

    <%=#content%>
    
编码可以防止数据中含有 HTML 字符串，避免引起 XSS 攻击。

### 逻辑

支持使用 js 原生语法

	<h1><%=title%></h1>
	<ul>
    	<%for(i = 0; i < list.length; i ++) {%>
        	<li>条目内容 <%=i + 1%> ：<%=list[i]%></li>
    	<%}%>
	</ul>
	
> 模板不能访问全局对象，公用的方法请参见文档[辅助方法](#辅助方法)章节

### 模板包含表达式

用于嵌入子模板。

    <% include('template_name') %>

子模板默认共享当前数据，亦可以指定数据：

    <% include('template_name', news_list) %>

## 辅助方法

使用``template.helper(name, callback)``注册公用辅助方法：

	template.helper('dateFormat', function (date, format) {
    	// ..
    	return value;
	});

模板中使用的方式：

    <%=dateFormat(content) %>
    
##	演示例子

*	[基本例子](http://aui.github.io/artTemplate/demo/template-native/basic.html)
*	[不转义HTML](http://aui.github.io/artTemplate/demo/template-native/no-escape.html)
*	[在javascript中存放模板](http://aui.github.io/artTemplate/demo/template-native/compile.html)
*	[嵌入子模板(include)](http://aui.github.io/artTemplate/demo/template-native/include.html)
*	[访问外部公用函数(辅助方法)](http://aui.github.io/artTemplate/demo/template-native/helper.html)

----------------------------------------------

本文档针对 artTemplate v3.0.0 编写