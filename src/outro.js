// CommonJs
if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = template;
// RequireJS && SeaJS
} else if (typeof define === 'function') {
    define(function() {
        return template;
    });
} else {
    this.template = template;
}

})();
