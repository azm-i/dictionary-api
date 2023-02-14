const gulp = require('gulp')
const path = require('path')

const { cache } = require('./util')

const gulpSvgSymbols = require('gulp-svg-symbols')
const gulpTinypngCompress = require('gulp-tinypng-compress')

const gulpWebp = require('gulp-webp')
const gulpRename = require('gulp-rename')

const CONFIG = require('../config')
const param = require('../param')

function svgSymbols() {
  return gulp
    .src(CONFIG.path.modules + '/svg/**/*.svg')
    .pipe(gulpSvgSymbols(CONFIG.svgSymbols))
    .pipe(gulp.dest(CONFIG.path.svgSymbols))
}

function watchSvg(cb) {
  gulp.watch(CONFIG.path.modules + '/svg/**/*.svg', svgSymbols)
  cb()
}

function image() {
  const stream = gulp
    .src(CONFIG.path.image)
    .pipe(cache('image'))
    .pipe(gulp.dest(CONFIG.path.distAssets))

  if (param.enableWebP) {
    stream
      .pipe(
        gulpRename((path) => {
          path.basename += path.extname // 生成ファイルのリネーム
        })
      )
      .pipe(gulpWebp()) // WebPの生成
      .pipe(gulp.dest(CONFIG.path.distAssets))
  }

  stream.on('end', () => {
    cache.write()
  })

  return stream
}

function watchImage(cb) {
  gulp.watch([CONFIG.path.image], image)
  cb()
}

function media() {
  return gulp
    .src(CONFIG.path.media)
    .pipe(cache('media'))
    .pipe(gulp.dest(CONFIG.path.distAssets))
    .on('end', () => {
      cache.write()
    })
}

function watchMedia(cb) {
  gulp.watch(
    [
      CONFIG.path.media,
      '!' + path.resolve(CONFIG.path.svgSymbols, 'svg-symbols.svg'),
    ],
    media
  )
  cb()
}

function tinypng(cb) {
  return gulp
    .src(CONFIG.path.tinypng)
    .pipe(cache('tinypng'))
    .pipe(
      gulpTinypngCompress({
        key: process.env.TINYPNG_API_KEY,
      })
    )
    .pipe(gulp.dest(CONFIG.path.src))
    .on('end', () => {
      cache.write()
    })
}

exports.svgSymbols = svgSymbols
exports.watchSvg = watchSvg
exports.image = image
exports.watchImage = watchImage
exports.media = media
exports.watchMedia = watchMedia
exports.tinypng = tinypng
