# 模板编译工具
============

可把模版编译成不依赖模版引擎的js文件，这样前端模版也可以向后端模版一样按文件放置，并且支持include等语句，真正实现前端模板模块化开发！

编译后的模板可以通过RequireJS、SeaJS等加载器进行异步加载，亦能利用它们成熟的打包合并工具进行上线前的优化。

## 演示例子

1.	双击打开 ``compile.cmd`` ，它将会自动编译模板
2.	打开 ``./demo/index.html`` 查看编译结果

示例模板文件夹：``./demo/templates/``


## 安装与使用

###	1. 版本选择：

windows批处理版本：``./compile.cmd``

>	在windows下，双击即可运行

NodeJS版本：``./compile.js``

>	基于NodeJS实现，支持跨平台运行

###	2. 设置配置：

右键可直接编辑编译工具的源码修改配置

	// 设置前端模板目录路径
	var $path = './demo/templates/';

	// 设置待处理的模版编码
	var $charset = 'UTF-8';

	// 设置辅助方法编译方式：
	// 为true则克隆到每个编译后的文件中，为false则单独输出到文件
	var $cloneHelpers = false;

	// 模板引擎路径
	var template = require('../../template.js');

	// 模板简单语法支持。不使用请注释此行
	// require('../../extensions/template-syntax.js');

	// js格式化工具路径
	var js_beautify = require('./lib/beautify.js');
	
### 3. 运行

1.	windows批处理版本可以双击直接运行。拖拽模板到 ``compile.cmd`` 文件上可单独编译当前模板
2.	NodeJS版本直接调用``node compile.js``即可运行。若附加参数可指定编译单个模板，如``node compile.js demo/templates/index.html``
	

## 模板include语句规范

``<%include(path)%>`` 支持动态引入子模板，为了让编译工具能够进行静态分析，需要如下约定：

一、include 的子模板无需后缀名

	
二、``path`` 参数不能够进行动态拼装

错误的写法：

	<%include('./tmpl-' + 'name')%>
	<%include(path)%>
	
正确的写法：

	<%include('./tmpl-id')%>

============


© cdc.tencent.com
