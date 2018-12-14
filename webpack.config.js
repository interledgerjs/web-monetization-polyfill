'use strict'
const webpack = require('webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  // mode: 'production',
  mode: 'development',

  entry: {
    'index': './src/index.js',
    'stream': './src/stream.js',
    'iframe': './src/iframe.js',
    'register': './src/register.js',
    'is-registered': './src/is-registered.js',
    'frame-call': './src/frame-call-export.js',
  },

  output: {
    filename: 'dist/[name].js',
    path: __dirname,
    libraryTarget: 'umd'
  },
  externals: {
    // 'crypto': 'WebMonetizationCryptoPolyfill'
  },

  module: {
    // noParse: [ /\bws$/ ],
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['es2017'],
          plugins: [['transform-runtime', {
            helpers: false,
            polyfill: false,
            regenerator: true, }]
          ]
        }
      }/*,
      {
        test: /\.css$/,
        loaders: ["style-loader", "css-loader"]
      },
      { test: /ed25519/, loader: 'null' },
      { test: /\.json$/, loader: 'json-loader' },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader?limit=10000&mimetype=application/font-woff&name=fonts/[name].[ext]"
      },{
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader?name=fonts/[name].[ext]"
      },{
        test: /\.(jpe?g|png|gif)$/,
        loader:'file-loader?name=img/[name].[ext]'
      }*/
    ]
  },
  optimization: {
    usedExports: true
  },

  plugins: [
    new CleanWebpackPlugin(['dist']),
    // new webpack.DefinePlugin({
    //   'require("./crypto")' : 'require("../../../src/crypto-polyfill")'
    // }),
    new webpack.NormalModuleReplacementPlugin(
      /node_modules\/ilp-protocol-stream\/src\/crypto.js/,
      '../../../src/crypto-polyfill.js'
    )
    // new BundleAnalyzerPlugin(),
  ],

  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    crypto: 'empty'
  }
}
