const cache = require('./cache');
const onerror = require('./onerror');
const imports = require('./imports');
const compressor = require('./compressor');

/**
 * 默认配置
 */
const config = {
    // 模板名字
    filename: null,
    // 模板内容
    source: null,
    // 逻辑语法开始标签
    openTag: '<%',
    // 逻辑语法结束标签
    closeTag: '%>',
    // 编码输出操作符（只支持一个字符）
    escapeSymbol: '=',
    // 原始输出操作符（只支持一个字符）
    rawSymbol: '-',
    // 是否编码输出语句
    escape: true,
    // 缓存（依赖 filename 字段）
    cache: cache,
    // 自定义语法格式器
    parser: null,
    // HTML 语句压缩器
    compressor: compressor,
    // 导入的变量
    imports: imports,
    // 错误处理函数
    onerror: onerror,
    // 编译调试版
    compileDebug: false,
    // 模板根目录（Node）
    root: '/',
    // 模板扩展名（Node, 只读）
    extension: '.html'
};

module.exports = config;