const onerror = require('./onerror');
const cache = require('./cache');

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
    // 是否编码输出变量的 HTML 字符 
    escape: true,
    // 是否开启缓存（依赖 options 的 filename 字段）
    cache: cache,
    // 是否压缩输出 HTML
    compress: false,
    // 自定义语法格式器
    parser: null,
    // 导入的变量
    imports: {},
    // 错误处理函数
    onerror: onerror,
    // 模板根目录
    root: '/',

    // TODO
    client: false
};

module.exports = config;