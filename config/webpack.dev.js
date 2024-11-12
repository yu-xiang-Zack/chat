// webpack.dev.js
const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const baseConfig = require('./webpack.base.js');

module.exports = merge(baseConfig, {
  mode: 'development',
  devServer: {
    port: 3000,
    compress: false,
    historyApiFallback: true,
    hot: true,
    static: {
      directory: path.join(__dirname, '../public'),
    },
  },
  devtool: 'eval-cheap-module-source-map',
  plugins: [
    new ReactRefreshWebpackPlugin(),
  ],
});
