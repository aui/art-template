/**
 * 压缩 HTML 输出语句
 * @param {string} source 
 */
const compressor = source => {
    return source
        // remove newline / carriage return
        .replace(/\n/g, "")

        // remove whitespace (space and tabs) before tags
        .replace(/[\t ]+\</g, "<")

        // remove whitespace between tags
        .replace(/\>[\t ]+\</g, "><")

        // remove whitespace after tags
        .replace(/\>[\t ]+$/g, ">")

        // remove comments
        .replace(/<!--[\w\W]*?-->/g, "");
};

module.exports = compressor;