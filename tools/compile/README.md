# 模板编译工具
============

可把模版编译成不依赖模版引擎的js文件，这样前端模版也可以向后端模版一样按文件放置，并且支持include等语句，真正前端模板模块化开发！

编译后的模板可以通过RequireJS、SeaJS等加载器进行异步加载，亦能利用它们成熟的打包合并工具进行上线前的优化。

## 运行演示例子

示例模板文件夹：``./demo/templates/``

1.	双击打开 ``compile.cmd`` ，它将会编译模板
2.	打开 ``./demo/index.html`` 查看js动态渲染后的页面

## 默认配置

右键可直接编辑 ``compile.cmd`` 的源码修改配置

	// 模板引擎
	include('../../template.js', 'UTF-8');

	// 模板引擎自定义语法支持。如果不使用语法插件请注释此行
	//include('../../extensions/template-syntax.js', 'UTF-8');

	// js格式化工具
	include('./lib/beautify.js', 'UTF-8');

	// 设置待处理的模版编码
	var $charset = 'UTF-8';
	
	// 设置模板存放目录
	var $path = './demo/templates/';
	
	// 设置克隆辅助方法编译方式：
	// 为true则克隆到每个编译后的文件中，为false则单独输出到文件
	var $cloneHelpers = false;
	

## 规范

编译工具是静态扫描，因此对模板 ``include(id)`` 语句的 ``id`` 参数不能够进行动态拼装。

错误的写法：

	<%include('tmpl-' + id)%>

正确的写法：

	<%include('tmpl-home')%>

============

注意：编译工具一个Beta版本，不建议在正是项目中使用。在这个完善的过程中期待 NodeJS 爱好者加入打造跨平台版本。

© cdc.tencent.com
