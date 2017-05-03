const onerror = require('../../../lib/compile/adapter/onerror');


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