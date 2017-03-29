class Cache {

    constructor() {
        this._data = {};
    }


    set(key, val) {
        this._data[key] = val;
    }


    get(key) {
        return this._data[key];
    }


    reset() {
        this._data = {};
    }
}

module.exports = new Cache();