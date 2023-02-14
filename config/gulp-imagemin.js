const imagemin = require('gulp-imagemin')
const pngquant = require('imagemin-pngquant')
const mozjpeg = require('imagemin-mozjpeg')

module.exports = (options = {}) => {
  const shared = [
    imagemin.svgo({
      plugins: [
        {
          cleanupIDs: false,
        },
      ],
    }),
    imagemin.gifsicle(),
  ]

  const plugins = options.lossy
    ? shared.concat([
        pngquant(),
        mozjpeg({
          quality: 90,
        }),
      ])
    : shared.concat([imagemin.jpegtran(), imagemin.optipng()])

  return {
    plugins,
    options: {
      verbose: options.verbose || false,
    },
  }
}
