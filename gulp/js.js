const { run } = require('./util')
const { isProd } = require('../param')

function js(cb) {
  run('webpack', [
    '--config',
    'webpack.config.js',
    isProd ? '--mode=production' : null,
  ])
  cb()
}

exports.js = js
