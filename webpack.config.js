var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry : './client/index.js',
  output : {
    path : path.join(__dirname, './client/static'),
      filename : 'bundle.js'
  },
  module : {
    loaders : [{
      test: /.js?$/,
      loaders : ['babel-loader', 'eslint-loader'],
      exclude: /node_modules/,
      query : {
        presets : ['env', 'react']
      }
    }]
  }
}