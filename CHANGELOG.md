# CHANGELOG

* 调试功能被增强：支持编译阶段捕获语法错误具体行
* `template.config()` 方法取消，请直接读写 `template.defaults`
* 开放更多的自定义选项
* 使用 ECMA5 构建，低于 IE9 的浏览器需要使用 ECMA5 补丁以及 JSON 库支持才可以运行
* 辅助方法 `helpers` 更名为 `imports`
* `onerror` 选项可以定制输出的调试信息
* `parser` 回调函数第三个参数接收 `tokens`
* 非编码输出由 `<%=#value%>` 改为 `<%-value>`（依然兼容旧版本的语法）
