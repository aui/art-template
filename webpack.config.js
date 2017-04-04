const path = require('path');
const webpack = require('webpack');
const version = require('./package.json').version;

module.exports = {
    entry: {
        'template-core': './src/template.js',
        'template': './src/index.js'
    },
    output: {
        path: path.join(__dirname, 'lib'),
        filename: '[name].js',
        library: 'template',
        libraryTarget: 'umd'
    },
    plugins: [
        new webpack.BannerPlugin(`art-template@${version} | https://github.com/aui/art-template`)
    ],
    node: {
        fs: 'empty',
        path: 'empty'
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['es2015']
                }
            }, { loader: 'eslint-loader' }],

        }]
    }
};