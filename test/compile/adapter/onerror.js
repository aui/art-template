const onerror = require('../../../src/compile/adapter/onerror');

module.exports = {
    onerror: {
        basic: () => {
            onerror({});
        }
    }
};
