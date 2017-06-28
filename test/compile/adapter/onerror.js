const onerror = require('../../../lib/compile/adapter/onerror');


module.exports = {
    'onerror': {
        'basic': () => {
            onerror({});
        }
    }
};