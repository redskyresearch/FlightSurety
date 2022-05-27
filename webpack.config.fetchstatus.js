const webpack = require('webpack')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const StartServerPlugin = require('start-server-webpack-plugin')

module.exports = {
    entry: ['webpack/hot/poll?3001','./src/fetchstatus/index'],
    watch: false,
    target: 'node',
    externals: [nodeExternals({
        whitelist: ['webpack/hot/poll?3001']
    })],
    module: {
        rules: [{
            test: /\.js?$/,
            use: 'babel-loader',
            exclude: /node_modules/
        }]
    },
    plugins: [
        new StartServerPlugin('fetchstatus.js'),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            "process.env": {
                "BUILD_TARGET": JSON.stringify('fetchstatus')
            }
        }),
    ],
    output: {
        path: path.join(__dirname, 'prod/server'),
        filename: 'fetchstatus.js'
    }
}