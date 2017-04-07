const debug = require('./adapter/debug');
const cache = require('./adapter/cache');
const escape = require('./adapter/escape');
const include = require('./adapter/include');

/**
 * 默认配置
 */
const defaults = {

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
    // 数据编码处理器
    escape: escape,
    // include 语句处理器
    include: include,
    // 缓存（依赖 filename 字段）
    cache: cache,
    // 模板逻辑表达式解析器
    parseExpression: null,
    // HTML 语句解析器
    parseString: null,
    // 导入的模板变量
    imports: {},
    // 调试处理函数
    debug: debug,
    // 是否编译调试版
    compileDebug: false,
    // bail 如果为 true，编译错误与运行时错误都会抛出异常
    bail: false,
    // 模板根目录（Node）
    root: '/',
    // 模板扩展名（Node, 只读）
    extname: '.html',

    /**
     * 继承默认配置
     * @param   {Object}    options
     * @returns {Object}
     */
    $extend: function(options) {
        const copy = Object.create(this);

        for (let name in options) {
            copy[name] = options[name]
        }

        if (this.escape) {
            copy.imports.$escape = this.escape;
        }

        if (this.include) {
            copy.imports.$include = this.include;
        }

        return copy;
    }
};

module.exports = defaults;