const postcssCustomMedia = require('postcss-custom-media')
const cssnano = require('cssnano')
const { isProd } = require('./param')

const plugins = [
  postcssCustomMedia({
    importFrom: {
      customMedia: {
        '--sp': 'screen and (max-width: 767px)',
      },
    },
  }),
]

if (isProd) {
  plugins.push(cssnano())
}

module.exports = {
  syntax: 'postcss-scss',
  plugins,
}
