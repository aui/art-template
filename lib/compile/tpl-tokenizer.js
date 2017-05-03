'use strict';

var TYPE_STRING = 'string';
var TYPE_EXPRESSION = 'expression';
var TYPE_RAW = 'raw';
var TYPE_ESCAPE = 'escape';

/**
 * 将模板转换为 Tokens
 * @param {string}      source 
 * @param {Object[]}    rules     @see defaults.rules
 * @param {Object}      context
 * @return {Object[]}
 */
var tplTokenizer = function tplTokenizer(source, rules, context) {

    var tokens = [{
        type: TYPE_STRING,
        value: source,
        line: 0,
        start: 0,
        end: source.length
    }];

    var walk = function walk(rule) {

        var flags = rule.test.ignoreCase ? 'ig' : 'g';
        var pattern = rule.test.source + '|^$|[\\w\\W]';
        var group = new RegExp(pattern, flags);

        for (var index = 0; index < tokens.length; index++) {

            if (tokens[index].type !== TYPE_STRING) {
                continue;
            }

            var line = tokens[index].line;
            var start = tokens[index].start;
            var end = tokens[index].end;

            var matchs = tokens[index].value.match(group);
            var substitute = [];

            for (var m = 0; m < matchs.length; m++) {
                var value = matchs[m];

                rule.test.lastIndex = 0;

                var values = rule.test.exec(value);
                var type = values ? TYPE_EXPRESSION : TYPE_STRING;
                var lastSubstitute = substitute[substitute.length - 1];
                var lastToken = lastSubstitute || tokens[index];
                var lastValue = lastToken.value;

                if (lastToken.line === line) {
                    start = lastSubstitute ? lastSubstitute.end : start;
                } else {
                    start = lastValue.length - lastValue.lastIndexOf('\n') - 1;
                }

                end = start + value.length;

                var token = { type: type, value: value, line: line, start: start, end: end };

                if (type === TYPE_STRING) {

                    if (lastSubstitute && lastSubstitute.type === TYPE_STRING) {

                        lastSubstitute.value += value;
                        lastSubstitute.end += value.length;
                    } else {

                        substitute.push(token);
                    }
                } else {

                    var script = rule.use.apply(context, values);
                    token.script = script;
                    substitute.push(token);
                }

                line += value.split(/\n/).length - 1;
            }

            tokens.splice.apply(tokens, [index, 1].concat(substitute));
            index += substitute.length - 1;
        }
    };

    for (var i = 0; i < rules.length; i++) {
        walk(rules[i]);
    }

    return tokens;
};

tplTokenizer.TYPE_STRING = TYPE_STRING;
tplTokenizer.TYPE_EXPRESSION = TYPE_EXPRESSION;
tplTokenizer.TYPE_RAW = TYPE_RAW;
tplTokenizer.TYPE_ESCAPE = TYPE_ESCAPE;

module.exports = tplTokenizer;