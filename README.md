# art-template

[![NPM Version](https://img.shields.io/npm/v/art-template.svg)](https://npmjs.org/package/art-template)
[![NPM Downloads](https://img.shields.io/npm/dm/art-template.svg)](https://npmjs.org/package/art-template)
[![Node.js Version](https://img.shields.io/node/v/art-template.svg)](http://nodejs.org/download/)
[![Coverage Status](https://coveralls.io/repos/github/aui/art-template/badge.svg)](https://coveralls.io/github/aui/art-template)

art-template 是一个性能出众、设计巧妙的模板引擎，无论在 NodeJS 还是在浏览器中都可以运行。

``NEW! v4.0``

1. 调试功能增强：支持编译阶段捕获语法错误具体行
2. 兼容 Ejs 模板语法
3. 支持原生语法与简洁语法混搭（参考 `template.bindSyntax()`）
4. NodeJS 支持 `require(templatePath)` 方式载入模板（参考 `template.bindExtname(extname)`）
5. 兼容 v3.0 模板语法
6. 修复旧版本模板语法可能因为空格导致出错的问题

## 特性

* 针对 Nodejs 与 V8 引擎优化，运行时速度是 Mustache、tpl 等模板引擎的 20 多倍
* 支持编译、运行时调试，可以定位到错误模板所在的行号
* 兼容 Ejs 模板语法
* 支持 ES 严格模式环境运行
* 支持预编译模板
* 支持原生 Javascript 和类似 Mustache 风格的模板语法
* 只有 5KB 大小

## 安装

```
npm install art-template --save
```

## 快速入门

```html
<% if (user) { %>
  <h2><%= user.name %></h2>
<% } %>
```

### 使用

```javascript
template(filename, data); // => Rendered HTML string

var render = template.compile(source, options);
render(data); // => Rendered HTML string

template.render(source, data, options); // => Rendered HTML string
```

## 语法

### 默认语法

```html
<% if (user) { %>
  <h2><%= user.name %></h2>
  <ul>
    <% for(var i = 0; i < user.tags.length; i++){ %>
        <%= user.tags[i] %>
    <% } %>
  </ul>
<% } %>
```

**编码后输出**

```html
<%= value %>
```

**原始输出**

```html
<%- value %>
```

**子模板**

```html
<% include('./header.html', $data) %>
```

**print**

```html
<% print(val, val2, val3) %>
```

### 超级语法

运行 `template.bindSyntax()` 即可开启超级语法。

```html
{{if user}}
  <h2>{{user.name}}</h2>
  <ul>
    {{each user.tags}}
        {{$value}}
    {{/each}}
  </ul>
{{/if}}
```

**编码后输出**

```html
{{value}}
```

**原始输出**

```html
{{@value}}
```

**条件控制**

```html
{{if value}}
    <!--content-->
{{else if value2}}
    <!--content-->
{{/if}}
```

**循环**

```html
{{each target}}
    {{$index}} {{$value}}
{{/each}}
```

```html
{{each target as val key}}
    {{key}} {{val}}
{{/each}}
```

`target` 支持 `Array` 与 `Object` 的迭代，其默认值为 `$data`。

**子模板**

```html
{{include './header.html' $data}}
```

**过滤器**

```javascript
template.imports.dateFormat = function(date, format){/*[code..]*/};
```

```html
{{time * 1000 | dateFormat 'yyyy-MM-dd hh:mm:ss'}}
```

**变量**

```html
{{set temp = data.sub.content}}
```

**嵌入原生 javascript 语句**

```html
{{%
    include('./header.html');
    for (var i = 0; i < list.length; i++) {
        print('value:', list[i]);
    }
%}}
```

## API

###	template(filename, data)

根据 `filename` 渲染模板。

#### NodeJS

```javascript
var filename = '/Users/aui/templates/tpl-user.html';
var html = templage(filename, {
    user: {
        name: 'aui'
    }
});
```

#### 浏览器

```html
<script id="tpl-user" type="text/html">
<% if (user) { %>
  <h2><%= user.name %></h2>
<% } %>
</script>

<script>
var filename = 'tpl-user';
var html = templage(filename, {
    user: {
        name: 'aui'
    }
});
</script>
```

###	template(filename, string)

编译模板并缓存。

```javascript
// compile && cache
template('/welcome.html', 'hi, <%=value%>.');

// use
template('/welcome.html', {
    value: 'aui'
}); // => "hi, aui."
```

###	template.compile(source, options)

编译模板并返回一个渲染函数。

```javascript
var render = template.compile('hi, <%=value%>.');
var html = render({value: 'aui'});
```

###	template.render(source, data, options)

编译并返回渲染结果。

```javascript
var html = template.render('hi, <%=value%>.', {value: 'aui'});
```

###	template.defaults

模板引擎默认配置。

```javascript
template.defaults.openTag = '<?js';
template.defaults.closeTag = '?>';
template.defaults.imports.$brackets = function(string) {
    return `『${string}』`;
};

var render = template.compile('hi, <?js=$brackets(value)?>.');
var html = render({value: 'aui'}); // => "hi, 『aui』."
```

### template.imports

向模板中注入上下文。这是 `template.defaults.imports` 的快捷方式。

```javascript
template.imports.$parseInt = parseInt;
```

```html
<%= $parseInt(value) %>
```

### template.cache

模板缓存中心。这是 `template.defaults.cache` 的快捷方式。

如果为 `false` 则不会启用缓存。

## 选项

```javascript
{
    // 模板名字。如果没有 source 字段，会根据此来加载模板
    filename: null,

    // 逻辑语法开始标签
    openTag: '<%',

    // 逻辑语法结束标签
    closeTag: '%>',

    // 编码输出操作符。只支持一个字符
    escapeSymbol: '=',

    // 原始输出操作符。只支持一个字符
    rawSymbol: '-',

    // 数据编码处理器
    escape: escape,

    // 模板内部 include 功能处理器
    include: include,

    // 缓存控制接口（依赖 filename 字段）
    cache: cache,

    // 模板逻辑表达式解析器。可用来声明自定义语法
    parseExpression: null,

    // HTML 语句解析器。可用来压缩 HTML
    parseString: null,

    // 导入的模板变量
    imports: {},

    // 调试处理函数
    debug: debug,

    // 是否编译调试版。编译为调试版本可以在运行时进行 DEBUG
    compileDebug: false,

    // bail 如果为 true，编译错误与运行时错误都会抛出异常
    bail: false,

    // 模板根目录。Node 环境专用
    root: '/',

    // 绑定的模板扩展名。Node 环境专用，template.bindExtname() 的默认配置
    extname: '.html',
}
```
