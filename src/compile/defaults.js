const onerror = require('./onerror');
const defaults = {
    filename: 'anonymous',
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
    cache: false,
    // 是否压缩输出
    compress: false,
    // 自定义语法格式器
    parser: null,
    // 导入的变量
    imports: {},
    /* //# sourceURL= */
    sourceURL: null,
    // 错误处理函数
    onerror: onerror,
    client: false,
    root: '/'
};

module.exports = defaults;