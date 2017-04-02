const webpack = require('webpack');
const version = require('./package.json').version;

module.exports = {
    entry: {
        'template': './src/index.js',
    },
    output: {
        path: 'dist',
        filename: '[name].js',
        library: `template`,
        libraryTarget: 'umd'
    },
    plugins: [
        new webpack.BannerPlugin('art-template@' + version + ' | https://github.com/aui/artTemplate')
    ],
    node: {
        fs: 'empty',
        path: 'path'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader?presets[]=es2015!eslint-loader'
        }]
    }
};