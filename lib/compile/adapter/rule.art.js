'use strict';

/**
 * 简洁模板语法规则
 */
var artRule = {
    test: /{{[ \t]*([@#]?)(\/?)([\w\W]*?)[ \t]*}}/,
    use: function use(match, raw, close, code) {

        var compiler = this;
        var options = compiler.options;
        var esTokens = compiler.getEsTokens(code.trim());
        var values = esTokens.map(function (token) {
            return token.value;
        });
        var result = {};

        var group = void 0;
        var output = raw ? 'raw' : false;
        var key = close + values.shift();

        // 旧版语法升级提示
        var warn = function warn(oldSyntax, newSyntax) {
            console.warn('Template upgrade:', '{{' + oldSyntax + '}}', '>>>', '{{' + newSyntax + '}}', '\n', options.filename || '');
        };

        // v3 compat: #value
        if (raw === '#') {
            warn('#value', '@value');
        }

        switch (key) {

            case 'set':

                code = 'var ' + values.join('');
                break;

            case 'if':

                code = 'if(' + values.join('') + '){';

                break;

            case 'else':

                var indexIf = values.indexOf('if');

                if (indexIf > -1) {
                    values.splice(0, indexIf + 1);
                    code = '}else if(' + values.join('') + '){';
                } else {
                    code = '}else{';
                }

                break;

            case '/if':

                code = '}';
                break;

            case 'each':

                group = artRule._split(esTokens);
                group.shift();

                if (group[1] === 'as') {
                    // ... v3 compat ...
                    warn('each object as value index', 'each object value index');
                    group.splice(1, 1);
                }

                var object = group[0] || '$data';
                var value = group[1] || '$value';
                var index = group[2] || '$index';

                code = '$each(' + object + ',function(' + value + ',' + index + '){';

                break;

            case '/each':

                code = '})';
                break;

            case 'echo':

                key = 'print';
                warn('echo value', 'value');

            case 'print':
            case 'include':
            case 'extend':

                group = artRule._split(esTokens);
                group.shift();
                code = key + '(' + group.join(',') + ')';
                break;

            case 'block':

                code = 'block(' + values.join('') + ',function(){';
                break;

            case '/block':

                code = '})';
                break;

            default:

                if (values.indexOf('|') !== -1) {

                    // 解析过滤器

                    var target = key;
                    var _group = [];
                    var v3split = ':'; // ... v3 compat ...
                    var list = values.filter(function (value) {
                        return !/^\s+$/.test(value);
                    });

                    // 找到要过滤的目标表达式
                    while (list[0] !== '|') {
                        target += list.shift();
                    } // 将过滤器解析成二维数组
                    list.filter(function (v) {
                        return v !== v3split;
                    }).forEach(function (value) {
                        if (value === '|') {
                            _group.push([]);
                        } else {
                            _group[_group.length - 1].push(value);
                        }
                    });

                    // 将过滤器管道化
                    _group.reduce(function (accumulator, filter) {
                        var name = filter.shift();
                        filter.unshift(accumulator);
                        return code = '$imports.' + name + '(' + filter.join(',') + ')';
                    }, target);
                } else if (options.imports[key]) {

                    // ... v3 compat ...
                    warn('filterName value', 'value | filterName');

                    group = artRule._split(esTokens);
                    group.shift();

                    code = key + '(' + group.join(',') + ')';
                    output = 'raw';
                } else {
                    code = '' + key + values.join('');
                }

                if (!output) {
                    output = 'escape';
                }

                break;
        }

        result.code = code;
        result.output = output;

        return result;
    },

    // 根据语义以空格进行切割
    _split: function _split(esTokens) {
        var current = 0;
        var lastToken = esTokens.shift();
        var group = [[lastToken]];

        while (current < esTokens.length) {
            var esToken = esTokens[current];
            var esTokenType = esToken.type;

            if (esTokenType !== 'whitespace' && esTokenType !== 'comment') {

                if (lastToken.type === 'punctuator' && lastToken.value !== ']' || esTokenType === 'punctuator') {
                    group[group.length - 1].push(esToken);
                } else {
                    group.push([esToken]);
                }

                lastToken = esToken;
            }

            current++;
        }

        return group.map(function (g) {
            return g.map(function (g) {
                return g.value;
            }).join('');
        });
    }
};

module.exports = artRule;