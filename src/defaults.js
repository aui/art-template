module.exports = {
    filename: 'anonymous',
    openTag: '<%', // 逻辑语法开始标签
    closeTag: '%>', // 逻辑语法结束标签
    output: '=',
    unescapeOutput: '=>',
    escape: true, // 是否编码输出变量的 HTML 字符
    cache: true, // 是否开启缓存（依赖 options 的 filename 字段）
    compress: false, // 是否压缩输出
    parser: null, // 自定义语法格式器
    onerror: e => {
        var message = 'Template Error\n\n';
        for (var name in e) {
            message += '<' + name + '>\n' + e[name] + '\n\n';
        }

        if (typeof console === 'object') {
            console.error(message);
        }

        return () => '{Template Error}';
    }
};