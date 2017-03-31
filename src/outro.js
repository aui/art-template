// CommonJs
if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = template;
// RequireJS && SeaJS
} else if (typeof define === 'function') {
    define(function() {
        return template;
    });
} else {
    // Browser globals
    var _template = this.template;

    template.noConflict = function() {
        if (this.template === template) {
            this.template = _template;
        }

        return template;
    };
    
    this.template = template;
}

})();
