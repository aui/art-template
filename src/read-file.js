const REQUIRE = 'require';

/**
 * 读取模板内容
 * @param   {string}    模板名
 * @param   {string}
 */
const readFile = filename => {

    if (typeof document === 'object') {
        const elem = document.getElementById(filename);
        if (elem) {
            return (elem.value || elem.innerHTML)
                .replace(/^\s*|\s*$/g, '');
        }
    } else {
        try {
            return global[REQUIRE]('fs').readFileSync(filename, 'utf8');
        } catch (e) {}
    }
};

module.exports = readFile;