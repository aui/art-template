const assert = require('assert');
const defaults = require('../../lib/compile/defaults');
module.exports = {
    'defaults': {
        'imports': () => {
            const imports = defaults.imports;
            const options = defaults.$extend({
                imports: {
                    test: 1
                }
            });

            assert.deepEqual(1, options.imports.test);
            assert.deepEqual(imports.$escape, options.imports.$escape);
            assert.deepEqual(undefined, imports.test);
        },

        'rules': () => {
            const rules = defaults.rules;
            const length = rules.length;
            const options = defaults.$extend({
                rules: [null]
            });

            assert.deepEqual(null, options.rules[0]);
            assert.deepEqual(rules[1], options.rules[1]);
            assert.deepEqual(length, rules.length);
        }
    }
};