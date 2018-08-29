const caches = {
    __data: Object.create(null),

    set: function(key, val) {
        this.__data[key] = val;
    },

    get: function(key) {
        return this.__data[key];
    },

    reset: function() {
        this.__data = {};
    }
};

module.exports = caches;
