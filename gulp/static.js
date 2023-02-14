const gulp = require('gulp')

const { cache } = require('./util')

const CONFIG = require('../config')

function staticFiles() {
  return gulp
    .src(CONFIG.path.static)
    .pipe(cache('staticFiles'))
    .pipe(gulp.dest(CONFIG.path.dist))
    .on('end', () => {
      cache.write()
    })
}

function watchStaticFiles(cb) {
  gulp.watch(CONFIG.path.static, staticFiles)
  cb()
}

exports.staticFiles = staticFiles
exports.watchStaticFiles = watchStaticFiles
