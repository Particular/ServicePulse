const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './app/modules/monitoring/monitoring.js',
    output: {
        filename: 'monitoring.dist.js',
        //filename: 'monitoring.[chunkhash].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new webpack.ContextReplacementPlugin(/\.\/locale$/, 'empty-module', false, /js$/)
    ],
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['env']
                }
            }
        }, {
            test: /\.html$/,
            use: [{
                loader: 'html-loader',
                //options: {
                //    minimize: true,
                //    removeComments: true,
                //    collapseWhitespace: true
                //}
            }]
        }, {
            test: /\.css$/,
            use: [
                'to-string-loader',
                'css-loader'
            ]
        }]
    },
    //devtool: 'eval-source-map'
};