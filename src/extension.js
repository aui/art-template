
const extension = (module, flnm) => {
    const filename = flnm || module.filename;
    const templatePath = require.resolve('art-template');
    const imports = 'var template=require(' + JSON.stringify(templatePath) + ')';
    const options = JSON.stringify({
        filename: filename
    }, null, 4);
    module._compile(imports + '\n' + `module.exports = template.compile(${options});`, filename);
};

module.exports = extension;