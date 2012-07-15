artTemplate 自定义语法扩展
===========

artTemplate 默认采用的是原生的 javascript 语法，类似微型模板引擎 tmpl。不同的是 artTemplate 的模板会采用沙箱机制限制全局对象的读写，这种机制很大程度上能够避免模板产生维护性的问题：若模板中若引用外部对象，随着项目复杂度增加，那时候谁都不能确定模板中的变量到底是数据还是全局对象，这种复杂的依赖关系将为会项目带来巨大的维护成本。在 artTemplage 的设计中，公用的方法与数据由 template.helper() 方法管理，既满足定义公用辅助方法的需求，也避免依赖外部对象产生维护问题。

众所周知 javascript 的语法非常自由，模板逻辑语句使用原生语法对于 javascript 开发人员来说几乎没有学习成本。但不可否认，模板的逻辑使用最多的也不过是条件表达式与循环表达式，而采用原生语法未免有大炮打蚊子的感觉，并且纯 javascript 语法对页面设计人员来说并不是那么容易掌握，因此设计一种简单易用的模板语法还是有必要的。

而 javascript 模板引擎语法无外乎三种类型：

1、崇尚强大与自由的原生语法派

{{{
<h3><%=title%></h3>
<ul>
    <% for (i = 0, l = list.length; i < l; i ++) { %>
        <li>name: <%=list[i].user%>; url: <%=list[i].site%></li>
    <% } %>
</ul>
}}}

2、崇尚干净利落的无逻辑派

{{{
<h3>{{title}}</h3>
<ul>
    {{#list}}
        <li>name: {{user}}; url: {{site}}</li>
    {{/list}}
</ul>
}}}

其中原生语法派以 tmpl 为代表，无逻辑派以 Mustache 为代表。原生语法派与无逻辑派各有优劣：tmpl 语法最为自由且强大，但弊端就是对设计人员不友好，阅读起来也比较吃力；而 Mustache 对设计人员非常友好，也非常利于模板迁移，但这种无逻辑语法弊端也十分明显，连最基本的数组索引值都没法输出。

3、求功能与易用平衡的中庸派

{{{
<h3>{{title}}</h3>
<ul>
    {{#each list as val}}
        <li>name: {{val.user}}; url: {{val.site}}</li>
    {{/each}}
</ul>
}}}

中庸派较好的在功能与易用性之前取得了平衡，而且这种类型的模板语法也经过了后端模板的工业级应用考验，相对来说比较成熟。artTemplate 的自定义语法扩展也采用此类型语法，上面的模板例子用 artTemplate 的写法：

{{{
<h3>{title}</h3>
<ul>
    {each list}
        <li>name: {$value.user}; url: {$value.site}</li>
    {/each}
</ul>
}}}

注：若没有特别说明，文章以下提到的 artTemplate 语法均指自定义语法。

## 1.安装扩展 ==

只需要把 template-syntax.js 合并到 template.js 即完成自定义语法扩展安装。

## 2.表达式 ==

"{" 与 "}" 符号包裹起来的语句则为模板的逻辑表达式。这两个界定符是可以自定义的，对应的配置属性接口是 template.openTag 与 template.closeTag。例如用 HTML 注释当作逻辑界定符：


    template.openTag = '<!--{';
    template.colseTag = '}-->';


## 2.1 输出表达式 ===

对内容编码输出：


    {content}


编码可以防止数据中含有 HTML 字符串，避免引起 XSS 攻击。

不编码输出：


    {echo content}


## 2.2 条件表达式


    {if admin}
        {content}
    {/if}



    {if user === 'admin'}
        {content}
    {else if user === '007'}
        <strong>hello world</strong>
    {/if}


### 2.3 遍历表达式

无论数组或者对象都可以用 each 进行遍历。


    {each list}
        <li>{$index}. {$value.user}</li>
    {/each}


其中 list 为要遍历的数据名称, $value 与 $index 是系统变量， $value 表示数据单条内容, $index 表示索引值，这两个变量也可以自定义：


    {each list as value index}
        <li>{index}. {value.user}</li>
    {/each}


### 2.4 模板包含表达式

用于嵌入子模板。


    {include 'templateID' data}


其中 'templateID' 是外部模板的 ID, data 为传递给 'templateID' 模板的数据。 data 参数若省略，则默认传入当前模板的数据。


    {include 'templateID'}


## 3.辅助方法

先使用 template.helper() 注册公用辅助方法，例如一个简单的 UBB 替换方法：


    template.helper('$ubb2html', function (content) {
        return content
        .replace(/\[b\]([^\[]*?)\[\/b\]/igm, '<b>$1</b>')
        .replace(/\[i\]([^\[]*?)\[\/i\]/igm, '<i>$1</i>')
        .replace(/\[u\]([^\[]*?)\[\/u\]/igm, '<u>$1</u>')
        .replace(/\[url=([^\]]*)\]([^\[]*?)\[\/url\]/igm, '<a href="$1">$2</a>')
        .replace(/\[img\]([^\[]*?)\[\/img\]/igm, '<img src="$1" />');
    });


模板中使用的方式：


    {$ubb2html content}


若辅助方法有多个参数使用一个空格分隔即可：


    {helperName args1 args2 args3}

----------------------------------------------

本文档针对 artTemplate v1.1 编写

© cdc.tencent.com