const cache = {
    _data: {},

    set: function(key, val) {
        this._data[key] = val;
    },

    get: function(key) {
        return this._data[key];
    },

    reset: function() {
        this._data = {};
    }
};

module.exports = cache;