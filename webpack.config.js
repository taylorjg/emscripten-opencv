/* eslint-env node */

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const { version } = require('./package.json')

const DIST_FOLDER = path.join(__dirname, 'dist')

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: DIST_FOLDER,
    filename: 'bundle.js',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { context: './src', from: '*.css' },
        { context: './src', from: 'images/*.png' },
        { context: './build', from: 'hello.js' },
        { context: './build', from: 'hello.wasm' },
        { context: './test', from: 'tests.html' },
        { context: './test', from: 'tests.js' }
      ]
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: false,
      version
    })
  ],
  devtool: 'source-map',
  devServer: {
    contentBase: DIST_FOLDER
  }
}
