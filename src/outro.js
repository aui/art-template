if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
  module.exports = template;
} else if (typeof define === 'function') {
  define(function() {
    return template;
  });
} else {
  this.template = template;
}

})();
