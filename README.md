# art-template

[![NPM Version](https://img.shields.io/npm/v/art-template.svg)](https://npmjs.org/package/art-template)
[![Node.js Version](https://img.shields.io/node/v/art-template.svg)](http://nodejs.org/download/)
[![Coverage Status](https://coveralls.io/repos/github/aui/art-template/badge.svg)](https://coveralls.io/github/aui/art-template)
[![Travis-ci](https://travis-ci.org/aui/art-template.svg?branch=master)](https://travis-ci.org/aui/art-template)


art-template 是一个性能出众、设计巧妙的模板引擎，无论在 NodeJS 还是在浏览器中都可以运行。

![chart](https://cloud.githubusercontent.com/assets/1791748/24965783/aa044388-1fd7-11e7-9d45-43b0e7ff5d86.png)

[在线速度测试](http://aui.github.io/art-template/docs/test-speed/)

`NEW!` *v4.0-beta*

1. 调试功能增强：定位语法错误
2. 同时支持原生 JavaScript 语法、简约语法
3. 兼容 [EJS](http://ejs.co) 模板语法、兼容 art-template@3.0 模板语法
4. NodeJS 支持 `require(templatePath)` 方式载入模板文件（默认后缀`.art`）
4. 支持定义模板的语法规则

## 特性

* 针对 NodeJS 与 V8 引擎优化，渲染速度出众
* 支持编译、运行时调试，可以定位到错误模板所在的行号
* 兼容 EJS 模板语法
* 支持 ES 严格模式环境运行
* 支持预编译模板
* 支持原生 JavaScript 和类似 Mustache 风格的模板语法
* 只有 5KB 大小

## 安装

```
npm install art-template@4.0.0-beta --save
```

## 快速入门

### NodeJS

```html
<!--./tpl-user.html-->
<% if (user) { %>
  <h2><%= user.name %></h2>
<% } %>
```

```javascript
var template = require('art-template');
var html = template(__diranme + '/tpl-user.html', {
    user: {
        name: 'aui'
    }
});
```

### 浏览器

```html
<script id="tpl-user" type="text/html">
<% if (user) { %>
  <h2><%= user.name %></h2>
<% } %>
</script>

<script src="art-template/lib/template.js"></script>
<script>
var html = template('tpl-user', {
    user: {
        name: 'aui'
    }
});
</script>
```

### 核心方法

```javascript
// 基于模板名渲染模板
template(filename, data);

// 将模板源代码编译成函数
template.compile(source, options);

// 将模板源代码编译成函数并立刻执行
template.render(source, data, options);
```

## 语法

art-template 同时支持 `{{expression}}` 简约语法与任意 JavaScript 表达式 `<% expression %>`。

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

等价：

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

### 标准输出

```html
{{value}}
```

```html
<%= value %>
```

### 原始输出

```html
{{@value}}
```

```html
<%- value %>
```

原始输出语句不会对 `HTML` 内容进行转义。

### 条件

```html
{{if value}}
    [...]
{{else if value2}}
    [...]
{{/if}}
```

```html
<% if (value) { %>
    [...]
<% else if (value2) { %>
    [...]
<% } %>
```

### 循环

```html
{{each target}}
    {{$index}} {{$value}}
{{/each}}
```

1. `target` 支持 `Array` 与 `Object` 的迭代，其默认值为 `$data`
2. `$value` 与 `$index` 可以自定义：`{{each target val key}}`

```html
<% for(var i = 0; i < target.length; i++){ %>
    <%= i %> <%= target[i] %>
<% } %>
```

### 变量

```html
{{set temp = data.sub.content}}
```

```html
<% var temp = data.sub.content; %>
```

### 子模板

```html
{{include './header.html' $data}}
```

```html
<% include('./header.html', $data) %>
```

`include` 第二个参数默认值为 `$data`，可以自定义。

### print

```html
<% print(val, val2, val3) %>
```

### 过滤器

```javascript
// 向模板中导入过滤器
template.imports.$dateFormat = function(date, format){/*[code..]*/};
template.imports.$timestamp = function(value){return value * 1000};
```

```html
{{date | $timestamp | $dateFormat 'yyyy-MM-dd hh:mm:ss'}}
```

```html
<%= $dateFormat($timestamp(date), 'yyyy-MM-dd hh:mm:ss') %>
```

## 全局变量

### 内置变量

* `$data`  传入模板的数据 `{Object|array}`
* `$imports`  外部导入的所有变量，等同 `template.imports` `{Object}`
* `print`  字符串输出函数 `{function}`
* `include`  子模板载入函数 `{function}`

> 如果数据中有特殊 key，可以通过 `$data` 加下标的方式访问，例如 `$data['user-list']`

### 注入全局变量

```javascript
template.imports.$console = console;
```

```html
<% $console.log('hello world') %>
```

模板外部所有的变量都需要使用 `template.imports` 注入、并且要在模板编译之前进行声明才能使用。

## 缓存

缓存默认是开启的，开发环境中可以关闭它：

```javascript
template.defaults.cache = false;
```

## 定义语法规则

从一个简单的例子说起，让模板引擎支持同时 ES6 `${name}` 模板字符串的解析：

```javascript
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

### 示例

创造一个 `<?js expression ?>` 语法模板：

```html
<?js if (user) { ?>
  <h2><?js= user.name ?></h2>
<?js } ?>
```

```javascript
template.defaults.rules.push({
    test: /<\?js([=-]?)([\w\W]*?)\?>/,
    use: function(match, output, code) {
        output = ({
            '=': 'escape',
            '-': 'raw',
            '': false
        }}[output];
        return {
            code: code,
            output: output
        }
    }
});
```

> 如果你需要创造一个非 JavaScript 的语法规则，可以在 `use` 函数中使用 `this.getEsTokens(code)` 获取 `code` 的 `esTokens` 来辅助解析

## 使用 `require(templatePath)`

引入 art-template 后，NodeJS 支持使用 `require()` 来加载 `.art` 后缀的模板文件。

```javascript
var template = require('art-template');
var view = require('./index.art');
var html = view(data); 
```

## API

###	template(filename, data)

根据模板名渲染模板。

```javascript
var html = template('/welcome.html', {
    value: 'aui'
});
```

> 在浏览器中，`filename` 请传入存放模板的元素 `id`
>
> 在 NodeJS 中，`filename` 如果非绝对路径，则会根据 `options.root` 来定位模板

###	template(filename, source)

编译模板并缓存。

```javascript
// compile && cache
template('/welcome.html', 'hi, <%=value%>.');

// use
template('/welcome.html', {
    value: 'aui'
});
```

###	.compile(source, options)

编译模板并返回一个渲染函数。

```javascript
var render = template.compile('hi, <%=value%>.');
var html = render({value: 'aui'});
```

###	.render(source, data, options)

编译并返回渲染结果。

```javascript
var html = template.render('hi, <%=value%>.', {value: 'aui'});
```

###	.defaults

模板引擎默认配置。参考 [选项](#选项)

```javascript
template.defaults.imports.$brackets = function(string) {
    return `『${string}』`;
};

var render = template.compile('hi, <?js=$brackets(value)?>.');
var html = render({value: 'aui'}); // => "hi, 『aui』."
```

### .imports

向模板中注入上下文。这是 `template.defaults.imports` 的快捷方式。

```javascript
template.imports.$parseInt = parseInt;
```

```html
<%= $parseInt(value) %>
```

## 选项

`template.defaults`

```javascript
{

    // 模板名字
    filename: null,

    // 模板语法规则
    rules: [nativeRule, artRule],

    // 是否支持对模板输出语句进行编码。为 false 则关闭编码输出功能
    escape: true,

    // 模板路径转换器
    resolveFilename: resolveFilename,

    // 缓存控制接口（依赖 filename 字段）。为 false 则关闭缓存
    cache: cache,

    // HTML 压缩器
    compress: null,

    // 导入的模板变量
    imports: {
        $each: each,
        $escape: escape,
        $include: include
    },

    // 调试处理函数
    debug: debug,

    // 模板文件加载器
    loader: loader,

    // 是否编译调试版。编译为调试版本可以在运行时进行 DEBUG
    compileDebug: false,

    // bail 如果为 true，编译错误与运行时错误都会抛出异常
    bail: false,

    // 模板根目录。Node 环境专用
    root: '/'
};
```

## 兼容性

1. NodeJS v1.0+
2. IE9+（小于 IE9 需要 [es5-shim](https://github.com/es-shims/es5-shim) 和 [JSON](https://github.com/douglascrockford/JSON-js) 支持）

## 授权协议

[MIT](./LICENSE)