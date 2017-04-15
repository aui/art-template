const path = require('path');
const webpack = require('webpack');
const version = require('./package.json').version;
const target = process.env.BUILD_TARGET || 'node';

const name = target === 'node' ? 'template-node' : 'template-web';
const libraryTarget = target === 'node' ? 'commonjs2' : 'umd';

module.exports = {
    entry: {
        [name]: path.resolve(__dirname, 'src', 'index')
    },
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: '[name].js',
        library: 'template',
        libraryTarget: libraryTarget

    },
    plugins: [
        new webpack.BannerPlugin(`art-template@${version} | https://github.com/aui/art-template`)
    ],
    target: target,
    node: target === 'node' ? {} : {
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
            }, {
                loader: 'eslint-loader'
            }],

        }]
    }
};