# artTemplate 简单语法扩展
###### 让模板语法简单优雅
===========

## 安装扩展

只需要把 extensions/template-syntax.js **合并**到 template.js 即完成自定义语法扩展安装。

## 表达式

``{{`` 与 ``}}`` 符号包裹起来的语句则为模板的逻辑表达式。

### 输出表达式

对内容编码输出：


    {{content}}


编码可以防止数据中含有 HTML 字符串，避免引起 XSS 攻击。

不编码输出：


    {{echo content}}


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


其中 list 为要遍历的数据名称, ``$value`` 与 ``$index`` 是系统变量， ``$value`` 表示数据单条内容, ``$index`` 表示索引值，这两个变量也可以自定义：


    {{each list as value index}}
    	<li>{{index}}. {{value.user}}</li>
    {{/each}}


### 模板包含表达式

用于嵌入子模板。


    {{include 'templateID' data}}


其中 'templateID' 是外部模板的 ID, data 为传递给 'templateID' 模板的数据。 data 参数若省略则默认传入当前模板的数据。


    {{include 'templateID'}}


## 辅助方法

使用``template.helper(name, callback)``注册公用辅助方法，例如一个基本的 UBB 替换方法：


    template.helper('$ubb2html', function (content) {
        return content
        .replace(/\[b\]([^\[]*?)\[\/b\]/igm, '<b>$1</b>')
        .replace(/\[i\]([^\[]*?)\[\/i\]/igm, '<i>$1</i>')
        .replace(/\[u\]([^\[]*?)\[\/u\]/igm, '<u>$1</u>')
        .replace(/\[url=([^\]]*)\]([^\[]*?)\[\/url\]/igm, '<a href="$1">$2</a>')
        .replace(/\[img\]([^\[]*?)\[\/img\]/igm, '<img src="$1" />');
    });


模板中使用的方式：


    {{$ubb2html content}}


若辅助方法有多个参数使用一个空格分隔即可：


    {{helperName args1 args2 args3}}

----------------------------------------------

本文档针对 artTemplate v2.0.2+ 编写

© cdc.tencent.com