const assert = require('assert');
const defaults = require('../../src/compile/defaults');
module.exports = {

    before: () => {
        console.log('#compile/defaults');
    },

    'defaults': {
        'imports': () => {
            const imports = defaults.imports;
            const options = defaults.$extend({
                imports: {
                    console
                }
            });

            assert.deepEqual(console, options.imports.console);
            assert.deepEqual(imports.$escape, options.imports.$escape);
            assert.deepEqual(undefined, imports.console);
        },

        'rules': () => {
            // const rules = defaults.rules;
            // const length = rules.length;
            // const options = defaults.$extend({
            //     rules: [null]
            // });

            // assert.deepEqual(null, options.rules[2]);
            // assert.deepEqual(rules[0], options.rules[0]);
            // assert.deepEqual(length, rules.length);

            const rules = defaults.rules;
            const length = rules.length;
            const options = defaults.$extend({
                rules: []
            });

            assert.deepEqual(0, options.rules.length);
            assert.deepEqual(length, rules.length);
        }
    }
};