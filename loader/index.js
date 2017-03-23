var template = require('art-template/dist/template');

module.exports = function(source) {
    this.cacheable && this.cacheable()

    var ANONYMOUS_RE = /^function\s+anonymous/

    template.onerror = function(e) {
        var message = 'Template Error\n\n';
        for (var name in e) {
            message += '<' + name + '>\n' + e[name] + '\n\n';
        }
        throw new SyntaxError(message)
    }

    var render = template.compile(source, {}).toString().replace(ANONYMOUS_RE, 'function');
    return 'module.exports = require("art-template/loader/runtime")(' + render + ');';
}