const autoprefixer = require('autoprefixer')
const mqpacker = require('css-mqpacker')
const cssnano = require('cssnano')
const { isProd } = require('../param')
const objectFit = require('postcss-object-fit-images')

module.exports = (options = {}) => {
  const { isSupportIe, objectFitPolyfill, minify } = options

  const plugins = [
    autoprefixer({
      grid: isSupportIe ? 'autoplace' : false,
    }),
    mqpacker(),
  ]

  if (objectFitPolyfill) plugins.push(objectFit)

  if (minify && isProd) plugins.push(cssnano())

  return plugins
}
