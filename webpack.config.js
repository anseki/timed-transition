/* eslint-env node, es6 */

'use strict';

const
  BASE_NAME = 'timed-transition',
  OBJECT_NAME = 'TimedTransition',

  webpack = require('webpack'),
  path = require('path'),
  PKG = require('./package'),

  RULES = require('./webpack.config.rules.js').concat([ // Join `webpack.config.rules.js` files
    'cssprefix'
  ].reduce((rules, packageName) =>
    rules.concat(require(`./node_modules/${packageName}/webpack.config.rules.js`)), [])),

  BUILD = process.env.NODE_ENV === 'production',

  ENTRY_PATH = path.resolve(__dirname, 'src', `${BASE_NAME}.js`),
  BUILD_PATH = BUILD ? __dirname : path.resolve(__dirname, 'test'),
  BUILD_FILE = `${BASE_NAME}${BUILD ? '.min' : ''}.js`;

module.exports = {
  entry: ENTRY_PATH,
  output: {
    path: BUILD_PATH,
    filename: BUILD_FILE,
    library: OBJECT_NAME,
    libraryTarget: 'var'
  },
  resolve: {mainFields: ['module', 'jsnext:main', 'browser', 'main']},
  module: {rules: RULES},
  devtool: BUILD ? false : 'source-map',
  plugins: BUILD ? [
    new webpack.optimize.UglifyJsPlugin({compress: {warnings: true}}),
    new webpack.BannerPlugin(
      `${PKG.title || PKG.name} v${PKG.version} (c) ${PKG.author.name} ${PKG.homepage}`)
  ] : []
};
