# CHANGELOG

* 辅助方法 `helpers` 更名为 `filters` ，并且仅在运行时依赖。例如 `{{data | dateFormat:'yyyy-MM-dd hh:mm:ss'}}` 原生语法 `<%=$filters(data, "dateFormat:'yyyy-MM-dd hh:mm:ss'")%>` 
* `onerror` 选项可以定制输出的调试信息
* `cache` 默认值由 `true` 改为 `{}`