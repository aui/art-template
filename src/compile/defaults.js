const debuger = require('./adapter/debuger');
const caches = require('./adapter/caches');
const escape = require('./adapter/escape');
const loader = require('./adapter/loader');
const include = require('./adapter/include');
const each = require('./adapter/each');
const nativeRule = require('./adapter/rule.native');
const artRule = require('./adapter/rule.art');
const resolveFilename = require('./adapter/resolve-filename');


/** 模板编译器默认配置 */
const defaults = {

    // 模板内容。如果没有此字段，则会根据 filename 来加载模板内容
    source: null,

    // 模板名字
    filename: null,

    // 模板语法规则列表
    rules: [nativeRule, artRule],

    // 是否支持对模板输出语句进行编码。为 false 则关闭编码输出功能
    escape: true,

    // 是否开启调试模式。如果为 true: {bail:false, cache:false, compileDebug:true}
    debug: false,

    // 是否开启缓存
    cache: true,

    // 是否编译调试版。编译为调试版本可以在运行时进行 DEBUG
    compileDebug: false,

    // 是否容错。如果为 true，编译错误与运行时错误都会抛出异常
    bail: false,

    // 模板路径转换器
    resolveFilename: resolveFilename,

    // HTML 压缩器
    compressor: null,

    // 错误调试器
    debuger: debuger,

    // 模板文件加载器
    loader: loader,

    // 缓存中心适配器（依赖 filename 字段）
    caches: caches,

    // 模板根目录。如果 filename 为全局路径，则会基于此查找模板
    root: '/',

    // 默认后缀名。如果没有后缀名，则会自动基于此补全
    extname: '.art',

    // 导入的模板变量
    imports: {
        $each: each,
        $escape: escape,
        $include: include
    }

};


/**
 * 继承默认配置
 * @param   {Object}    options
 * @return {Object}
 */
defaults.$extend = function(options) {
    const copy = Object.create(this);

    for (let name in options) {
        copy[name] = options[name]
    }

    return copy;
};


module.exports = defaults;