const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'none',
    entry: {
        dashboard: './app/js/dashboard/dashboard.js',
        shell: './app/migrate/modules/shell/shell.js',
        monitoring: './app/migrate/modules/monitoring/monitoring.js',
        configuration: './app/migrate/modules/configuration/configuration.js',
    },
    output: {
        filename: '[name].dist.js',
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
        new MiniCssExtractPlugin({
            filename: 'vendor.css',
        })
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
            test: /.ts?$/,
            exclude: /node_modules/,
            use: {
                loader: 'ts-loader',
            },
            
        }, {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader'],
        }, {
            test: require.resolve('jquery'), loader: 'expose-loader?$!expose-loader?jQuery'
        },
        { test: /\.(png|woff|woff2|eot|ttf)$/, use: [{ loader: 'url-loader?limit=100000' }] },
        { test: /\.svg$/, use: [{ loader: 'file-loader' }] },
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    devtool: 'eval-source-map',
    watch: true,
    watchOptions: {
        ignored: /node_modules/
    }
};