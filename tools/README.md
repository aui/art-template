# artTemplate 自动化工具
============

## 编译工具

> 可把模版编译成不依赖模版引擎的js文件，这样前端模版也可以向后端模版一样按文件放置，并且支持include等语句。
> 
> 编译后的模板可以通过RequireJS、SeaJS等加载器进行异步加载。

### 1. 批处理版本

双击打开“compile.cmd”会遍历目录以及子目录所有的HTML文件并编译输出兼容RequireJS、SeaJS的模块。

右键编辑“compile.cmd”可以配置模板文件夹路径以及模板编码（默认UTF-8）

### 2. 在线版本

[compile.html](http://aui.github.com/artTemplate/tools/compile.html) 是在线版本，功能比较简单。


## 抽取工具

[combine.html](http://aui.github.com/artTemplate/tools/combine.html) 可以把页面中内嵌的模板抽取出来，以便部署在外部js文件中。

============

© cdc.tencent.com
