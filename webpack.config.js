/* eslint-env node */

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const { version } = require('./package.json')

const distFolder = path.join(__dirname, 'dist')

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: distFolder,
    filename: 'bundle.js',
  },
  plugins: [
    new CopyWebpackPlugin([
      { context: './src', from: '*.html' },
      { context: './src', from: '*.css' },
      { context: './src', from: '*.png' },
      { context: './build', from: 'hello.js' },
      { context: './build', from: 'hello.wasm' }
    ]),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: false,
      version
    })
  ],
  devtool: 'source-map',
  devServer: {
    contentBase: distFolder
  }
}
