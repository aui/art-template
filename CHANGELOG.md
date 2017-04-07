# CHANGELOG

* 调试功能增强：支持编译阶段捕获语法错误具体行
* `template.config()` 方法取消，请直接读写 `template.defaults`
* `template.helpers` 更改为 `templatedefaults.imports`
* `defaults.debug` 选项可以定制输出的调试信息
* `defaults.parser` 回调函数第三个参数接收 `tokens`
* 兼容 ejs 的模板
* 使用 ECMA5 构建，低于 IE9 的浏览器需要使用 ECMA5 补丁以及 JSON 库支持才可以运行
* `<%=value%>` 语句支持输出 JSON
