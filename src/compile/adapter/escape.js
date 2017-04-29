// 将目标转成字符
const toString = value => {
    if (typeof value !== 'string') {
        if (typeof value === 'function') {
            value = toString(value.call(value));
        } else if (value === null) {
            value = '';
        } else {
            // number | array | object | undefined
            value = JSON.stringify(value) || '';
        }
    }

    return value;
};


// 编码 HTML 内容
const ESCAPE_REG = /["&'<>]/;
const xmlEscape = content => {
    const html = '' + content;
    const regexResult = ESCAPE_REG.exec(html);
    if (!regexResult) {
        return content;
    }

    let result = '';
    let i, lastIndex, char;
    for (i = regexResult.index, lastIndex = 0; i < html.length; i++) {

        switch (html.charCodeAt(i)) {
            case 34:
                char = '&#34;';
                break;
            case 38:
                char = '&#38;';
                break;
            case 39:
                char = '&#39;';
                break;
            case 60:
                char = '&#60;';
                break;
            case 62:
                char = '&#62;';
                break;
            default:
                continue;
        }

        if (lastIndex !== i) {
            result += html.substring(lastIndex, i);
        }

        lastIndex = i + 1;
        result += char;
    }

    if (lastIndex !== i) {
        return result + html.substring(lastIndex, i);
    } else {
        return result;
    }
};


/**
 * 编码模板输出的内容
 * @param  {any}   content
 * @return {string}
 */
const escape = content => xmlEscape(toString(content));


module.exports = escape;