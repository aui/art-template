var path = require('path');
var acorn = require('acorn');
var escodegen = require('escodegen');
var estraverse = require('estraverse');
var template = require('./template-node');
var importsPath = require.resolve('./imports');
var CONSTS = template.compile.Compiler.CONSTS;
var LOCAL_MODULE = /^\.+\//;

var defaults = function (options) {
    // new defaults
    var setting = {
        imports: importsPath,
        bail: true,
        cache: false,
        debug: false
    };

    for (var name in options) {
        setting[name] = options[name];
    }

    return template.defaults.$extend(setting);
};


var convertFilenameNode = function (node, options) {
    if (node.type === 'Literal') {

        // to relative
        if (options.root && !LOCAL_MODULE.test(node.value)) {
            node.value = './' + path.relative(options.root, node.value).replace(/^\.\//, '');
        }

        // add extname
        if (options.extname && !path.extname(node.value)) {
            node.value += options.extname;
        }

        delete node.raw;
    }

    return node;
};



/**
 * 预编译模版，将模板编译成 javascript 代码
 * 使用静态分析，将模板内部之间依赖转换成 `require()`
 * @param  {Object}       options  编译选项
 * @return {string}
 */
var precompile = function (options) {
    options = options || {};

    if (typeof options.filename !== 'string') {
        throw Error('template.precompile(): "options.filename" required');
    }

    options = defaults(options);


    var imports = options.imports;


    if (typeof imports !== 'string') {
        throw Error('template.precompile(): "options.imports" is a file. Example:\n' +
            'options: { imports: require.resolve("art-template/lib/imports") }\n');
    } else {
        options.imports = require(imports);
    }


    var isLocalModule = LOCAL_MODULE.test(imports);
    var tplImportsPath = isLocalModule ? imports : path.relative(path.dirname(options.filename), imports);


    var code = template.compile(options).toString();
    var ast = acorn.parse('(' + code + ')');
    var extendNode = null;
    var functions = [CONSTS.INCLUDE, CONSTS.EXTEND, CONSTS.LAYOUT];


    var enter = function (node) {
        if (node.type === 'VariableDeclarator' &&
            functions.indexOf(node.id.name) !== -1) {

            this.remove();

        } else if (node.type === 'CallExpression' &&
            node.callee.type === 'Identifier' &&
            functions.indexOf(node.callee.name) !== -1) {

            var replaceNode;
            switch (node.callee.name) {

                case CONSTS.EXTEND:

                    extendNode = convertFilenameNode(node.arguments[0], options);
                    replaceNode = {
                        "type": "AssignmentExpression",
                        "operator": "=",
                        "left": {
                            "type": "Identifier",
                            "name": CONSTS.FROM
                        },
                        "right": extendNode
                    };
                    break;

                case CONSTS.LAYOUT:

                    replaceNode = {
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
                    break;

                case CONSTS.INCLUDE:

                    var filenameNode = convertFilenameNode(node.arguments[0], options);
                    var dataNode = node.arguments[1] || {
                        "type": "Identifier",
                        "name": CONSTS.DATA
                    };

                    replaceNode = {
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
                    break;
            }

            return replaceNode;
        }
    };

    ast = estraverse.replace(ast, {
        enter: enter
    });

    code = escodegen.generate(ast).replace(/^\(|\)[;\s]*?$/g, '');
    code = 'var ' + CONSTS.IMPORTS + ' = require(' + JSON.stringify(tplImportsPath) + ');\n' +
        'module.exports = ' + code + ';';

    return code;
};


module.exports = precompile;