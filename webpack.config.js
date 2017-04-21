const path = require('path');
const webpack = require('webpack');
const packageInfo = require('./package.json');
const version = packageInfo.version;
const dependencies = Object.keys(packageInfo.dependencies || {});
const peerDependencies = Object.keys(packageInfo.peerDependencies || {});
const modules = dependencies.concat(...peerDependencies);

const entry = path.resolve(__dirname, 'src', 'index');
const dist = path.resolve(__dirname, 'lib');
const banner = new webpack.BannerPlugin(`art-template@${version} | https://github.com/aui/art-template`);
const rule = {
    test: /\.js$/,
    use: [{
        loader: 'babel-loader',
        options: {
            presets: ['es2015']
        }
    }, {
        loader: 'eslint-loader'
    }],

};


module.exports = [{
    target: 'node',
    entry: {
        'template-node': entry
    },
    output: {
        path: dist,
        filename: '[name].js',
        library: 'template',
        libraryTarget: 'commonjs2'
    },
    externals: modules,
    plugins: [banner],
    module: {
        rules: [rule]
    }
}, {
    target: 'web',
    entry: {
        'template-web': entry
    },
    output: {
        path: dist,
        filename: '[name].js',
        library: 'template',
        libraryTarget: 'umd'
    },
    node: {
        'fs': 'empty',
        'path': 'empty',
        'process': false
    },
    resolve: {
        alias: {
            'html-minifier': 'node-noop'
        }
    },
    plugins: [banner, new webpack.optimize.UglifyJsPlugin()],
    module: {
        rules: [rule]
    }
}];