
// RequireJS && SeaJS
if (typeof define === 'function') {
    define(function() {
        return template;
    });

// NodeJS
} else if (typeof exports !== 'undefined') {
    module.exports = template;
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
