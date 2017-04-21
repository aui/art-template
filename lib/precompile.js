var path = require('path');
var acorn = require('acorn');
var escodegen = require('escodegen');
var estraverse = require('estraverse');
var template = require('./template-node');
var importsPath = require.resolve('./template-imports');
var CONSTS = template.compile.Compiler.CONSTS;




/**
 * 预编译模版，将模板编译成 javascript 代码
 * 模板内部之间依赖使用 `commonjs2` 处理
 * @param  {string|Object} source   模板内容
 * @param  {?Object}       options  编译选项
 * @return {string}
 */
var precompile = function (source, options) {
    options = options || {};

    if (typeof source === 'object') {
        options = source;
    } else {
        options.source = source;
    }

    if (typeof options.filename !== 'string') {
        throw Error('template.precompile(): "options.filename" required');
    }

    // defaults
    var setting = {
        imports: importsPath,
        bail: true,
        cache: false,
        debug: false
    };

    for (var name in options) {
        setting[name] = options[name];
    }

    options = setting;
    source = options.source;
    var imports = options.imports;
    var LOCAL_MODULE = /^\.+\//;

    if (typeof imports !== 'string') {
        throw Error('template.precompile(): "options.imports" is a file. Example:\n' +
            'options: { imports: require.resolve("art-template/lib/template-imports") }\n');
    }

    var isLocalModule = LOCAL_MODULE.test(imports);
    var tplImportsPath = isLocalModule ? imports : path.relative(path.dirname(options.filename), imports);

    options.imports = require(imports);

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
                        if (options.root && filenameNode.type === 'Literal' && !LOCAL_MODULE.test(filenameNode.value)) {
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

    render = escodegen.generate(ast).replace(/^\(|\)[;\s]*?$/g, '');
    render = 'var ' + CONSTS.IMPORTS + ' = require(' + JSON.stringify(tplImportsPath) + ');\n' + 'module.exports = ' + render + ';';

    return render;
};


module.exports = precompile;