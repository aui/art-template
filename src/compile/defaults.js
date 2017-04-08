const debug = require('./adapter/debug');
const cache = require('./adapter/cache');
const escape = require('./adapter/escape');
const loader = require('./adapter/loader');
const include = require('./adapter/include');
const resolveFilename = require('./adapter/resolve-filename');
const each = require('./adapter/each');
const nativeSyntax = require('./adapter/syntax.native');
const artSyntax = require('./adapter/syntax.art');

/** 模板编译器默认配置 */
const defaults = {

    // 模板内容
    source: null,

    // 模板名字。如果没有 source 字段，会根据此来加载模板
    filename: null,

    // 模板语法解析器
    syntax: [nativeSyntax, artSyntax],

    // 数据编码处理器
    escape: escape,

    // 模板内部 include 功能处理器
    include: include,

    // 模板路径转换器
    resolveFilename: resolveFilename,

    // 缓存控制接口（依赖 filename 字段）
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

    // 绑定的模板扩展名。Node 环境专用，template.bindExtname() 的默认配置
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

        copy.imports.$each = each;

        return copy;
    }
};

module.exports = defaults;