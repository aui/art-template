/**
 * 压缩 HTML 输出语句
 * @param {string} source 
 */
const compress = source => {
    return source
        .replace(/\s+/g, ` `)
        .replace(/<!--[\w\W]*?-->/g, ``);
};

module.exports = compress;