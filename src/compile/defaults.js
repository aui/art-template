const debug = require('./adapter/debug');
const cache = require('./adapter/cache');
const escape = require('./adapter/escape');
const loader = require('./adapter/loader');
const include = require('./adapter/include');
const resolveFilename = require('./adapter/resolve-filename');
const each = require('./adapter/each');
const nativeRule = require('./adapter/rule.native');
const artRule = require('./adapter/rule.art');

/** 模板编译器默认配置 */
const defaults = {

    // 模板内容。如果没有此字段，则会根据 filename 来加载模板内容
    source: null,

    // 模板名字
    filename: null,

    // 模板语法规则
    rules: [nativeRule, artRule],

    // 数据编码处理器。为 false 则关闭编码输出功能
    escape: escape,

    // 模板内部 include 功能处理器
    include: include,

    // 模板路径转换器
    resolveFilename: resolveFilename,

    // 缓存控制接口（依赖 filename 字段）。为 false 则关闭缓存
    cache: cache,

    // HTML 压缩器
    compress: null,

    // 导入的模板变量
    imports: {},

    // 调试处理函数
    debug: debug,

    // 模板文件加载器
    loader: loader,

    // 是否编译调试版。编译为调试版本可以在运行时进行 DEBUG
    compileDebug: false,

    // bail 如果为 true，编译错误与运行时错误都会抛出异常
    bail: false,

    // 模板根目录。Node 环境专用
    root: '/',

    // 绑定的模板扩展名。Node 环境专用，template.bindExtname(template, [extname]) 的默认配置
    extname: '.html'

};


/**
 * 继承默认配置
 * @param   {Object}    options
 * @returns {Object}
 */
defaults.$extend = function(options) {
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

    copy.imports.$each = each;

    return copy;
};


module.exports = defaults;