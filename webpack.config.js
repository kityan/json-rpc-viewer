const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = function () {

  const config = {
    entry: {
      app: './src/app.js',
    },
    output: {
      path: path.join(__dirname, '/dist'),
      filename: '[name].js',
    },
    resolve: {
      modules: ['./node_modules']
    },
    plugins: [
      new CopyWebpackPlugin([
        {
          from: './src/assets'
        },
      ]),
    ]
  }

  return config
}
