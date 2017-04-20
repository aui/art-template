var path = require('path');
var acorn = require('acorn');
var escodegen = require('escodegen');
var estraverse = require('estraverse');

var template = require('./lib/template-node.js');
var templatePath = require.resolve('./lib/template-node.js');
var imports = 'var template=require(' + JSON.stringify(templatePath) + ')';
var CONSTS = template.compile.Compiler.CONSTS;



/**
 * require.extensions 扩展注册函数
 * 使用动态编译机制
 * @param {Object} module 
 * @param {string} flnm 
 */
template.extension = function (module, flnm) {
    var filename = flnm || module.filename;
    var options = JSON.stringify({
        filename: filename
    });

    module._compile(imports + '\n' + 'module.exports = template.compile(' + options + ');', filename);
};


/**
 * 预编译模版，将模板编译成 javascript 代码
 * 模板内部之间依赖使用 `commonjs2` 处理
 * @param  {string|Object} source   模板内容
 * @param  {?Object}       options  编译选项
 * @return {string}
 */
template.precompile = function (source, options) {
    options = options || {};

    if (typeof source === 'object') {
        options = source;
    } else {
        options.source = source;
    }

    var setting = {
        imports: 'art-template/lib/template-imports',
        bail: true,
        cache: false,
        debug: false
    };

    for (var name in options) {
        setting[name] = options[name];
    }

    options = setting;
    source = options.source;

    if (typeof options.filename !== 'string') {
        throw Error('template.precompile(): "options.filename" required');
    }

    if (typeof options.imports !== 'string') {
        throw Error('template.precompile(): "options.imports" is a file. Example:\n' +
            'options: { imports: require.resolve("art-template/lib/template-imports") }\n');
    }

    var importsPath = path.relative(path.dirname(options.filename), options.imports);
    options.imports = require(options.imports);

    var render = template.compile(source, options).toString();
    var ast = acorn.parse('(' + render + ')');
    var extendNode = null;
    var functions = [CONSTS.INCLUDE, CONSTS.EXTEND, CONSTS.LAYOUT];

    ast = estraverse.replace(ast, {
        enter: function (node) {
            if (node.type === 'VariableDeclarator' &&
                functions.indexOf(node.id.name) !== -1) {

                this.remove();

            } else if (node.type === 'CallExpression' &&
                node.callee.type === 'Identifier' &&
                functions.indexOf(node.callee.name) !== -1) {

                switch (node.callee.name) {

                    case CONSTS.EXTEND:

                        extendNode = node.arguments[0];

                        return {
                            "type": "AssignmentExpression",
                            "operator": "=",
                            "left": {
                                "type": "Identifier",
                                "name": CONSTS.FROM
                            },
                            "right": extendNode
                        };

                    case CONSTS.LAYOUT:
                        return {
                            "type": "CallExpression",
                            "callee": {
                                "type": "CallExpression",
                                "callee": {
                                    "type": "Identifier",
                                    "name": "require"
                                },
                                "arguments": [extendNode]
                            },
                            "arguments": [{
                                    "type": "Identifier",
                                    "name": CONSTS.DATA
                                },
                                {
                                    "type": "Identifier",
                                    "name": CONSTS.BLOCKS
                                }
                            ]
                        };

                    case CONSTS.INCLUDE:

                        var filenameNode = node.arguments[0];
                        var dataNode = node.arguments[1] || {
                            "type": "Identifier",
                            "name": CONSTS.DATA
                        };

                        // 处理全局模板路径
                        if (options.root && filenameNode.type === 'Literal' && /^[^\.]/.test(filenameNode.value)) {
                            filenameNode.value = './' + path.relative(options.root, filenameNode.value).replace(/^\.\//, '');
                            delete filenameNode.raw;
                        }

                        var requireNode = {
                            "type": "AssignmentExpression",
                            "operator": "+=",
                            "left": {
                                "type": "Identifier",
                                "name": CONSTS.OUT
                            },
                            "right": {
                                "type": "CallExpression",
                                "callee": {
                                    "type": "CallExpression",
                                    "callee": {
                                        "type": "Identifier",
                                        "name": "require"
                                    },
                                    "arguments": [filenameNode]
                                },
                                "arguments": [dataNode]
                            }
                        };


                        return requireNode;
                }


            }
        }
    });

    render = escodegen.generate(ast);
    render = 'var ' + CONSTS.IMPORTS + ' = require(' + JSON.stringify(importsPath) + ');\n' + 'module.exports = ' + render;

    return render;
};


// 默认注册 .art 文件
require.extensions[template.defaults.extname] = template.extension;

module.exports = template;