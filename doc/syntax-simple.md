# artTemplate 简洁语法版

## 使用

引用简洁语法的引擎版本，例如：

    <script src="dist/template.js"></script>
    
 [下载](https://raw.github.com/aui/artTemplate/master/dist/template.js)

## 表达式

``{{`` 与 ``}}`` 符号包裹起来的语句则为模板的逻辑表达式。

### 输出表达式

对内容编码输出：

    {{content}}

不编码输出：

    {{#content}}
    
编码可以防止数据中含有 HTML 字符串，避免引起 XSS 攻击。

### 条件表达式

    {{if admin}}
        {{content}}
    {{/if}}
    {{if user === 'admin'}}
        {{content}}
    {{else if user === '007'}}
        <strong>hello world</strong>
    {{/if}}

### 遍历表达式

无论数组或者对象都可以用 each 进行遍历。

    {{each list}}
        <li>{{$index}}. {{$value.user}}</li>
    {{/each}}

其中 list 为要遍历的数据字段名, ``$value`` 与 ``$index`` 是系统变量， ``$value`` 表示数据单条内容, ``$index`` 表示索引值，这两个变量也可以自定义：

    {{each list as value index}}
        <li>{{index}}. {{value.user}}</li>
    {{/each}}

### 模板包含表达式

用于嵌入子模板。

    {{include 'template_name'}}

子模板默认共享当前数据，亦可以指定数据：

    {{include 'template_name' news_list}}

## 辅助方法

使用``template.helper(name, callback)``注册公用辅助方法，例如一个基本的 UBB 替换方法：

    template.helper('$ubb2html', function (content) {
        // 处理字符串...
        return content;
    });

模板中使用的方式：

    {{$ubb2html content}}

若辅助方法有多个参数使用一个空格分隔即可：

    {{helperName args1 args2 args3}}
    
##	演示例子

*	[基本例子](http://aui.github.io/artTemplate/demo/basic.html)
*	[不转义HTML](http://aui.github.io/artTemplate/demo/no-escape.html)
*	[在javascript中存放模板](http://aui.github.io/artTemplate/demo/compile.html)
*	[嵌入子模板(include)](http://aui.github.io/artTemplate/demo/include.html)
*	[访问外部公用函数(辅助方法)](http://aui.github.io/artTemplate/demo/helper.html)

----------------------------------------------

本文档针对 artTemplate v3.0.0+ 编写