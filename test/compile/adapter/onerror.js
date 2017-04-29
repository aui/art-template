const onerror = require('../../../src/compile/adapter/onerror');


module.exports = {
    before: () => {
        console.log('#compile/adapter/onerror');
    },

    'onerror': {
        'basic': () => {
            onerror({});
        }
    }
};