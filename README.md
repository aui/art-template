# art-template

[![NPM Version](https://img.shields.io/npm/v/art-template.svg)](https://npmjs.org/package/art-template)
[![NPM Downloads](http://img.shields.io/npm/dm/art-template.svg)](https://npmjs.org/package/art-template)
[![Node.js Version](https://img.shields.io/node/v/art-template.svg)](http://nodejs.org/download/)
[![Travis-ci](https://travis-ci.org/aui/art-template.svg?branch=master)](https://travis-ci.org/aui/art-template)
[![Coverage Status](https://coveralls.io/repos/github/aui/art-template/badge.svg?branch=master)](https://coveralls.io/github/aui/art-template?branch=master)

art-template 是一个渲染性能出众模板引擎，无论在 NodeJS 还是在浏览器中都可以运行。

![chart](https://cloud.githubusercontent.com/assets/1791748/24965783/aa044388-1fd7-11e7-9d45-43b0e7ff5d86.png)

[在线速度测试](http://aui.github.io/art-template/example/web-test-speed/)

## 特性

* 拥有接近 JavaScript 渲染极限的的性能
* 调试友好：语法、运行时错误日志精确到模板所在行；支持支持在模板文件上打断点（Webpack Loader）
* 支持压缩输出页面中的 HTML、CSS、JS 代码
* 支持 NodeJS 与 浏览器。支持 Express、Koa、Webpack
* 支持模板继承与子模板
* 兼容 [EJS](http://ejs.co)、[Underscore](http://underscorejs.org/#template)、[LoDash](https://lodash.com/docs/#template) 模板语法
* 支持 ES 严格模式环境运行
* 支持原生 JavaScript 语法与简约语法混合书写
* 支持自定义模板的语法解析规则
* 浏览器版本仅 6KB 大小

[art-template@4 新特性详细介绍](https://github.com/aui/art-template/issues/369)

## 快速入门

### 模板语法

```html
<% if (user) { %>
  <h2><%= user.name %></h2>
<% } %>

或：

{{if user}}
  <h2>{{user.name}}</h2>
{{/if}}
```

### NodeJS

```js
var template = require('art-template');
var html = template(__dirname + '/tpl-user.art', {
    user: {
        name: 'aui'
    }
});
```

### Web

1\. 使用浏览器版本：[lib/template-web.js](https://raw.githubusercontent.com/aui/art-template/master/lib/template-web.js)

2\. 在页面中存放模板：

```html
<script id="tpl-user" type="text/html">
<% if (user) { %>
  <h2><%= user.name %></h2>
<% } %>
</script>
```

3\. 渲染模板：

```js
var html = template('tpl-user', {
    user: {
        name: 'aui'
    }
});
```

### 核心方法

```js
// 基于模板名渲染模板
template(filename, data);

// 将模板源代码编译成函数
template.compile(source, options);

// 将模板源代码编译成函数并立刻执行
template.render(source, data, options);
```

## 安装

```shell
npm install art-template --save
```

## Express

[express-art-template](https://github.com/aui/express-art-template)

## Koa

[koa-art-template](https://github.com/aui/koa-art-template)

## Webpack

[art-template-loader](https://github.com/aui/art-template-loader)

## 语法

art-template 同时支持 `{{expression}}` 简约语法与任意 JavaScript 表达式 `<% expression %>`。

### 输出

**1\. 标准输出**

```html
{{value}}
{{data.key}}
{{data['key']}}
{{a ? b : c}}
{{a || b}}
{{a + b}}

或

<%= value %>
<%= data.key %>
<%= data['key'] %>
<%= a ? b : c %>
<%= a || b %>
<%= a + b %>
```

模板一级特殊变量可以使用 `$data` 加下标的方式访问：

```
{{$data['user list']}}
```

**2\. 原始输出**

```html
{{@value}}

或

<%- value %>
```

原始输出语句不会对 `HTML` 内容进行转义

### 条件

```html
{{if value}} ... {{/if}}
{{if v1}} ... {{else if v2}} ... {{/if}}

或

<% if (value) { %> ... <% } %>
<% if (value) { %> ... <% } else { %> ... <% } %>
```

### 循环

```html
{{each target}}
    {{$index}} {{$value}}
{{/each}}

或

<% for(var i = 0; i < target.length; i++){ %>
    <%= i %> <%= target[i] %>
<% } %>
```

1. `target` 支持 `Array` 与 `Object` 的迭代，其默认值为 `$data`
2. `$value` 与 `$index` 可以自定义：`{{each target val key}}`

### 变量

```html
{{set temp = data.sub.content}}

或

<% var temp = data.sub.content; %> 
```

### 模板继承

```html
{{extend './layout.art'}}
{{block 'head'}} ... {{/block}}

或

<% extend('./layout.art') %>
<% block('head', function(){ %> ... <% }) %>
```

模板继承允许你构建一个包含你站点共同元素的基本模板“骨架”。

#### 范例

layout.art:

```html
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{block 'title'}}My Site{{/block}}</title>

    {{block 'head'}}
    <link rel="stylesheet" href="main.css">
    {{/block}}
</head>
<body>
    {{block 'content'}}{{/block}}
</body>
</html>
```

index.art:

```html
{{extend './layout.art'}}

{{block 'title'}}{{title}}{{/block}}

{{block 'head'}}
    <link rel="stylesheet" href="custom.css">
{{/block}}

{{block 'content'}}
<p>This is just an awesome page.</p>
{{/block}}
```

渲染 index.art 后，将自动应用布局骨架。

### 子模板

```html
{{include './header.art'}}
{{include './header.art' data}}

或

<% include('./header.art') %>
<% include('./header.art', data) %>
```

`include` 第二个参数默认值为 `$data`。

### print

```html
<% print(val, val2, val3) %>
```

### 过滤器

```js
// 向模板中导入全局变量
template.defaults.imports.$dateFormat = function(date, format){/*[code..]*/};
template.defaults.imports.$timestamp = function(value){return value * 1000};
```

因为 `imports` 定义的全局变量的优先级会比普通模板变量高，所以建议命名使用 `$` 前缀。 

```html
{{date | $timestamp | $dateFormat 'yyyy-MM-dd hh:mm:ss'}}

或

<%= $dateFormat($timestamp(date), 'yyyy-MM-dd hh:mm:ss') %>
```

`{{value | filter}}` 过滤器语法类似管道操作符，它的上一个输出作为下一个输入。

## 压缩 HTML、CSS、JS

```js
template.defaults.minimize = true;
```

art-template 的页面压缩功能是在编译阶段实现的，因此完全不影响渲染速度，并且能够加快网络传输速度。但也有一个限制，它不能正常处理未闭合的 HTML 标签，因此使用 `include` 语句载入模板片段的时候请小心。

请避免书写这样的模板：

```html
<body>
```
或：

```html
</body></html>
```

使用 [模板继承](#模板继承) 代替 `include` 可以避免这样的问题出现。

## 调试

设置 `template.defaults.debug=true` 后，它会设置如下选项：

```json
{
    "bail": false,
    "cache": false,
    "minimize": false,
    "compileDebug": true
}
```

`debug` 默认配置：

* Node 环境 = `process.env.NODE_ENV !== 'production'`
* 浏览器环境 = `false`

## 全局变量

### 内置变量清单

* `$data`     传入模板的数据 `{Object|array}`
* `$imports`  外部导入的所有变量，等同 `template.defaults.imports` `{Object}`
* `$escape`   编码 HTML 内容 `{function}` 
* `print`     字符串输出函数 `{function}`
* `include`   子模板载入函数 `{function}`
* `extend`    模板继承模板导入函数 `{function}`
* `block`     模板块声明函数 `{function}`

### 注入全局变量

```js
template.defaults.imports.$console = console;
```

```html
<% $console.log('hello world') %>
```

模板外部所有的变量都需要使用 `template.defaults.imports` 注入、并且要在模板编译之前进行声明才能使用。

## 配置语法规则

### 修改界定符

art-template 支持修改默认模板界定符 `{{}}` 与 `<%%>`：

```js
// 原生语法的界定符规则
template.defaults.rules[0].test = /<%(#?)((?:==|=#|[=-])?)([\w\W]*?)(-?)%>/;
// 简洁语法的界定符规则
template.defaults.rules[1].test = /{{[ \t]*([@#]?)(\/?)([\w\W]*?)[ \t]*}}/;
```

它们是一个正则表达式，你可以只修改界定符部分。例如修改 `<%%>` 为 `{%%}`：

```js
var rule = template.defaults.rules[0];
rule.test = new RegExp(rules.test.source.replace('<%', '{%').replace('%>', '%}'));
```

### 添加语法

从一个简单的例子说起，让模板引擎支持 ES6 `${name}` 模板字符串的解析：

```js
template.defaults.rules.push({
    test: /\${([\w\W]*?)}/,
    use: function(match, code) {
        return {
            code: code,
            output: 'escape'
        }
    }
});
```

其中 `test` 是匹配字符串正则，`use` 是匹配后的调用函数。关于 `use` 函数：

* 参数：一个参数为匹配到的字符串，其余的参数依次接收 `test` 正则的分组匹配内容
* 返回值：必须返回一个对象，包含 `code` 与 `output` 两个字段：
    * `code` 转换后的 JavaScript 语句
    * `output` 描述 `code` 的类型，可选值：
        * `'escape'` 编码后进行输出
        * `'raw'` 输出原始内容
        * `false` 不输出任何内容

值得一提的是，语法规则对渲染速度没有影响，模板引擎编译器会帮你优化渲染性能。

## 使用 `require(templatePath)`

加载 `.art` 模板：

```js
var template = require('art-template');
var view = require('./index.art');
var html = view(data); 
```

加载 `.ejs` 模板：

```js
var template = require('art-template');
require.extensions['.ejs'] = template.extension;

var view = require('./index.ejs');
var html = view(data); 
```

需要注意的是：此功能仅对 NodeJS 生效，如果要在浏览器中使用模板文件渲染功能，请使用 Webpack [art-template-loader](https://github.com/aui/art-template-loader)。

## API

###	template(filename, data)

根据模板名渲染模板。

```js
var html = template('/welcome.art', {
    value: 'aui'
});
```

> 在浏览器中，`filename` 请传入存放模板的元素 `id`

###	template(filename, source)

编译模板并缓存。

```js
// compile && cache
template('/welcome.art', 'hi, <%=value%>.');

// use
template('/welcome.art', {
    value: 'aui'
});
```

###	.compile(source, options)

编译模板并返回一个渲染函数。

```js
var render = template.compile('hi, <%=value%>.');
var html = render({value: 'aui'});
```

###	.render(source, data, options)

编译并返回渲染结果。

```js
var html = template.render('hi, <%=value%>.', {value: 'aui'});
```

###	.defaults

模板引擎默认配置。参考 [选项](#选项)。

## 选项

`template.defaults`

```js
{
    // 模板名
    filename: null,

    // 模板语法规则列表
    rules: [nativeRule, artRule],

    // 是否开启对模板输出语句自动编码功能。为 false 则关闭编码输出功能
    // escape 可以防范 XSS 攻击
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

    // 错误事件。仅在 bail 为 false 时生效
    onerror: onerror,

    // 模板文件加载器
    loader: loader,

    // 缓存中心适配器（依赖 filename 字段）
    caches: caches,

    // 模板根目录。如果 filename 字段不是本地路径，则在 root 查找模板
    root: '/',

    // 默认后缀名。如果没有后缀名，则会自动添加 extname
    extname: '.art',

    // 导入的模板变量
    imports: {
        $each: each,
        $escape: escape,
        $include: include
    }
};
```

## 兼容性

1. NodeJS v1.0+
2. IE8+（IE8 需要 [es5-shim](https://github.com/es-shims/es5-shim)，[示例](./example/web-ie-compatible/index.html)）

## 授权协议

[MIT](./LICENSE)

<img width="256" src="https://cloud.githubusercontent.com/assets/1791748/25306225/7f218e50-27bb-11e7-8dc2-30b2a923e6e9.png" alt="微信支付" />

如果你因 art-template 受益，不妨请我喝杯咖啡 :-)
