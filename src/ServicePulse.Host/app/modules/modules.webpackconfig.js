const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: {
        shell: './app/modules/shell/shell.js',
        monitoring: './app/modules/monitoring/monitoring.js',
    },
    output: {
        filename: '[name].dist.js',
        //filename: 'monitoring.[chunkhash].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new webpack.ContextReplacementPlugin(/\.\/locale$/, null, false, /js$/),
        new webpack.ProvidePlugin({
            jQuery: 'jquery'
        }),
        new webpack.ProvidePlugin({
            moment: 'moment'
        }),
        new ExtractTextPlugin("vendor.css"),
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
                options: {
                    minimize: true,
                    removeComments: true,
                    collapseWhitespace: true
                }
            }]
            }, {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            }, {
            test: require.resolve('jquery'), loader: 'expose-loader?$!expose-loader?jQuery'
        },
        { test: /\.(png|woff|woff2|eot|ttf)$/, use: [{ loader: 'url-loader?limit=100000' }] },
        { test: /\.svg$/, use: [{ loader: 'file-loader' }] },
        ]
    },
    devtool: 'eval-source-map',
    watch: true,
    watchOptions: {
        ignored: /node_modules/
    }
};