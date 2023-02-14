const path = require('path')
const gulp = require('gulp')
const gulpif = require('gulp-if')
const plumber = require('gulp-plumber')

const gulpSass = require('gulp-sass')(require('sass'))
const sassGlob = require('gulp-sass-glob')
const sassVariables = require('gulp-sass-variables')
const styleAliases = require('gulp-style-aliases')
const postcss = require('gulp-postcss')
const stylelint = require('gulp-stylelint')
const replace = require('gulp-replace')

const CONFIG = require('../config')
const { isProd, isDev, enableMinify, enableMinFontSize } = require('../param')

const option = {
  root: path.resolve(CONFIG.path.modules, 'css'),
  objectFitPolyfill: CONFIG.browsers.isSupportIe,
}

option.isSupportIe = CONFIG.browsers.isSupportIe
option.minify = enableMinify && isProd

function sass() {
  return gulp
    .src(CONFIG.path.sass, {
      sourcemaps: isDev,
    })
    .pipe(gulpif(isDev, plumber(CONFIG.plumber)))
    .pipe(stylelint(CONFIG.stylelint))
    .pipe(replace(/^/, "@use 'sass:math';\n"))
    .pipe(
      styleAliases({
        '~~': path.resolve(CONFIG.path.modulesDefault, 'css'),
        '@@': path.resolve(CONFIG.path.modulesDefault, 'css'),
        '~': path.resolve(CONFIG.path.modules, 'css'),
        '@': path.resolve(CONFIG.path.modules, 'css'),
      })
    )
    .pipe(sassGlob())
    .pipe(
      sassVariables({
        $rootDirAssets: CONFIG.SITE_INFO.rootDirAssets,
        $rootDir: CONFIG.SITE_INFO.rootDir.replace(/\/$/, ''),
        $enableMinFontSize: enableMinFontSize,
      })
    )
    .pipe(gulpSass(CONFIG.sass(option)).on('error', gulpSass.logError))
    .pipe(postcss(CONFIG.postcss(option)))
    .pipe(gulp.dest(CONFIG.path.distAssets, { sourcemaps: isDev }))
}

function watchSass(cb) {
  gulp.watch([CONFIG.path.sass, CONFIG.path.modules + '/**/*.scss'], sass)
  cb()
}

exports.sass = sass
exports.watchSass = watchSass
