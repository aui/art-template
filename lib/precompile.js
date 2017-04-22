const path = require('path');
const acorn = require('acorn');
const escodegen = require('escodegen');
const estraverse = require('estraverse');
const sourceMap = require('source-map');
const mergeSourceMap = require('merge-source-map');
const template = require('./template-node');
const importsPath = require.resolve('./imports');
const CONSTS = template.compile.Compiler.CONSTS;
const LOCAL_MODULE = /^\.+\//;



// 获取默认设置
const defaults = options => {
    // new defaults
    const setting = {
        imports: importsPath,
        bail: true,
        cache: false,
        debug: false,

        sourceMap: false,
        sourceRoot: options.sourceRoot
    };

    for (let name in options) {
        setting[name] = options[name];
    }

    return template.defaults.$extend(setting);
};



// 转换外部模板文件引入语句的 filename 参数节点
const convertFilenameNode = (node, options) => {
    if (node.type === 'Literal') {

        // to relative path
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



// 获取原始渲染函数的 sourceMap
const getOldSourceMap = (map, {sourceRoot, source, file}) => {
    const oldSourceMap = new sourceMap.SourceMapGenerator({
        file,
        sourceRoot
    });

    map.forEach(map => {
        oldSourceMap.addMapping({
            generated: {
                line: map.generated.line + 1,
                column: map.generated.start + 1
            },
            source,
            original: {
                line: map.original.line + 1,
                column: map.original.start + 1
            },
            name: 'christopher'
        });
    });

    return oldSourceMap.toJSON();
};



/**
 * 预编译模版，将模板编译成 javascript 代码
 * 使用静态分析，将模板内部之间依赖转换成 `require()`
 * @param  {Object}       options  编译选项
 * @return {Object}
 */
const precompile = options => {
    options = options || {};

    if (typeof options.filename !== 'string') {
        throw Error('template.precompile(): "options.filename" required');
    }

    options = defaults(options);


    let code = null;
    let sourceMap = null;
    let ast = null;
    const imports = options.imports;
    const functions = [CONSTS.INCLUDE, CONSTS.EXTEND, CONSTS.LAYOUT];

    if (typeof imports !== 'string') {
        throw Error('template.precompile(): "options.imports" is a file. Example:\n' +
            'options: { imports: require.resolve("art-template/lib/imports") }\n');
    } else {
        options.imports = require(imports);
    }


    const isLocalModule = LOCAL_MODULE.test(imports);
    const tplImportsPath = isLocalModule ? imports : path.relative(path.dirname(options.filename), imports);
    const fn = template.compile(options);


    code = '(' + fn.toString() + ')';
    ast = acorn.parse(code, {
        locations: options.sourceMap
    });


    let extendNode = null;
    const enter = function (node) {
        if (node.type === 'VariableDeclarator' &&
            functions.indexOf(node.id.name) !== -1) {

            this.remove();

        } else if (node.type === 'CallExpression' &&
            node.callee.type === 'Identifier' &&
            functions.indexOf(node.callee.name) !== -1) {

            let replaceNode;
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


    if (options.sourceMap) {
        
        const sourceRoot = options.sourceRoot;
        const source = path.relative(sourceRoot, options.filename);
        const file = path.basename(source);
        const gen = escodegen.generate(ast, {
            sourceMap: source,
            file: file,
            sourceMapRoot: sourceRoot,
            sourceMapWithCode: true
        });
        code = gen.code;

        const newSourceMap = gen.map.toJSON();
        const oldSourceMap = getOldSourceMap(fn.map, {sourceRoot, source, file});
        sourceMap = mergeSourceMap(oldSourceMap, newSourceMap);
        sourceMap.file = file;

    } else {
        code = escodegen.generate(ast);
    }


    code = code.replace(/^\(|\)[;\s]*?$/g, '');
    code = 'var ' + CONSTS.IMPORTS + ' = require(' + JSON.stringify(tplImportsPath) + ');\n' +
        'module.exports = ' + code + ';';

    return {
        code,
        ast,
        sourceMap,
        toString: function () {
            return code;
        }
    };
};


module.exports = precompile;