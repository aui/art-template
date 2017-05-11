# CHANGELOG

## v4.9.1

1. 修复模板内部 `$escape` 与 `$each` 变量可能没有定义的问题 [#3](https://github.com/aui/express-art-template/issues/3) [#1](https://github.com/aui/express-art-template/issues/1)

## v4.9.0

1. 增强调试功能：日志输出错误行号以及上下文

## v4.8.2

1. 修复子模板没有继承父模板编译 options 问题
2. 渲染函数参数可以为空

## v4.8.1

1. 修复低版本 NodeJS 报错问题

## v4.8.0

1. 过滤器支持在运行时注入 [#4](https://github.com/aui/art-template-loader/issues/4)
2. 过滤器语法可以直接使用全局对象，无需特别声明。例如 `{{url | encodeURIComponent}}`

## v4.7.0

1. 增加 `ignore` 配置，可以让模板编译器忽略指定的变量初始化
2. 增加 `htmlMinifierOptions` 配置，可对  [htmlMinifie](https://github.com/kangax/html-minifier) 压缩器进行配置

## v4.6.0

1. `$escape()` 函数提高 4 倍性能
2. 支持输出 sourceMap: sourcesContent

## v4.5.1

1. 修复 `{{/if}}` 语句不支持头尾空格的问题
2. 修复 NodeJS 版本兼容问题 [#393](https://github.com/aui/art-template/issues/393)

## v4.5.0

1. 支持对 `options.imports` 的深拷贝 [#1](https://github.com/aui/express-art-template/issues/1)
2. 支持对 `options.rules` 的覆盖

## v4.4.2

1. 兼容 IE8

## v4.4.1

1. 修正 `root` 配置的行为，如果 filename 为全局模块路径，会直接根据 `root` 来定位
2. 修复多行模板逻辑表达式下 sourceMap 行号记录不准确的 BUG
3. 标准化错误处理

## v4.4.0

1. 预编译 API 支持输出 sourceMap

## v4.3.2

1. 修复 web 版本无法被 requirejs 加载问题

## v4.3.1

1. 修复预编译 API 默认配置 `imports` 错误问题

## v4.3.0

1. NodeJS: 支持预编译 API

## v4.2.1

1. 适配器 `loader`、`onerror`、`htmlMinifier` 第二个参数接收 `options`

## v4.2.0

1. 支持 HTML、CSS、JS 压缩（`minimize: true`）。同时废弃 `compressor` 字段
2. 修复配置 `debuger` 拼写错误，`debuger` 更名为 `onerror`
3. 将模板全局变量 `$options` 私有化

## v4.1.0

1. 支持 layout
2. 修复 `{{if else value}}` 语句 BUG
3. 修复多个 `include` 语句共存导致路径的 BUG

## v4.0.0

1. 调试功能增强：支持编译阶段捕获语法错误具体行
2. `template.config()` 方法取消，请直接读写 `template.defaults`
3. `template.helpers` 更改为 `template.defaults.imports`
4. `template.defaults.debuger` 选项可以定制输出的调试信息
5. `template.defaults.parser` 被取消，使用更强大的 `template.defaults.rules` 代替
6. 兼容 EJS 的模板
7. 使用 ECMA5 构建，低于 IE9 的浏览器需要使用 ECMA5 补丁以及 JSON 库支持才可以运行
8. `<%=value%>` 语句支持输出 JSON

##	v3.1.0

1. 修复``template.runder()``方法与文档表现不一致的问题
2. 去掉鸡肋的``fs.watch``特性

##	v3.0.3

1. 解决``template.helper()``方法传入的数据被转成字符串的问题 #96
2. 解决``{{value || value2}}``被识别为管道语句的问题 #105 <https://github.com/aui/tmodjs/issues/48>

##	v3.0.2

1.	~~解决管道语法必须使用空格分隔的问题~~

## v3.0.1

1.	适配 express3.x 与 4.x，修复路径 BUG

## v3.0.0

1. 提供 NodeJS 专属版本，支持使用路径加载模板，并且模板的``include``语句也支持相对路径
2. 适配 [express](http://expressjs.com) 框架
3. 内置``print``语句支持传入多个参数
4. 支持全局缓存配置
5. 简洁语法版支持管道风格的 helper 调用，例如：``{{time | dateFormat:'yyyy年 MM月 dd日 hh:mm:ss'}}``

当前版本接口有调整，请阅读 [升级参考](#升级参考)

> artTemplate 预编译工具 [TmodJS](https://github.com/aui/tmodjs) 已更新

##	v2.0.4

1.	修复低版本安卓浏览器编译后可能产生语法错误的问题（因为此版本浏览器 js 引擎存在 BUG）

##	v2.0.3

1.	优化辅助方法性能
2.	NodeJS 用户可以通过 npm 获取 artTemplate：``$ npm install art-template -g``
3.	不转义输出语句推荐使用``<%=#value%>``（兼容 v2.0.3 版本之前使用的``<%==value%>``），而简版语法则可以使用``{{#value}}``
4.	提供简版语法的合并版本 dist/[template-simple.js](https://raw.github.com/aui/artTemplate/master/dist/template-simple.js)

## v2.0.2

1.	优化自定义语法扩展，减少体积
2.	[重要]为了最大化兼容第三方库，自定义语法扩展默认界定符修改为``{{``与``}}``。
3.	修复合并工具的BUG [#25](https://github.com/aui/artTemplate/issues/25)
4.	公开了内部缓存，可以通过``template.cache``访问到编译后的函数
5.	公开了辅助方法缓存，可以通过``template.helpers``访问到
6.	优化了调试信息

## v2.0.1

1.	修复模板变量静态分析的[BUG](https://github.com/aui/artTemplate/pull/22)

## v2.0 release

1.	~~编译工具更名为 atc，成为 artTemplate 的子项目单独维护：<https://github.com/cdc-im/atc>~~

## v2.0 beta5

1. 修复编译工具可能存在重复依赖的问题。感谢 @warmhug
2. 修复预编译``include``内部实现可能产生上下文不一致的问题。感谢 @warmhug
3. 编译工具支持使用拖拽文件进行单独编译

## v2.0 beta4

1. 修复编译工具在压缩模板可能导致 HTML 意外截断的问题。感谢 @warmhug
2. 完善编译工具对``include``支持支持，可以支持不同目录之间模板嵌套
3. 修复编译工具没能正确处理自定义语法插件的辅助方法

## v2.0 beta1

1.	对非 String、Number 类型的数据不输出，而 Function 类型求值后输出。
2.	默认对 html 进行转义输出，原文输出可使用``<%==value%>``（备注：v2.0.3 推荐使用``<%=#value%>``），也可以关闭默认的转义功能``template.defaults.escape = false``。
3.	增加批处理工具支持把模板编译成不依赖模板引擎的 js 文件，可通过 RequireJS、SeaJS 等模块加载器进行异步加载。