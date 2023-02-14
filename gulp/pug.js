const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const gulpif = require('gulp-if')
const plumber = require('gulp-plumber')

const gulpPug = require('gulp-pug')
const data = require('gulp-data')
const imageSize = require('image-size')
const htmlBeautify = require('gulp-html-beautify')
const htmlhint = require('gulp-htmlhint')
const rename = require('gulp-rename')

const CONFIG = require('../config')
const param = require('../param')
const { isProd, isDev, isPhp, isExample } = require('../param')

let uniqueId = 0

const locals = (file) => ({
  IS_PROD: isProd,
  IS_PHP: isPhp,
  ROOT_DIR: CONFIG.SITE_INFO.rootDir,
  ROOT_DIR_ASSETS: CONFIG.SITE_INFO.rootDirAssets,
  ENABLE_POLYFILL: param.enablePolyfill,
  ENABLE_WEBP: param.enableWebP,
  ENABLE_ASYNCHRONOUS_TRANSITION: param.enableEventAsynchronousTransition,
  detectExistFile: (srcPath) => {
    let filePath
    if (CONFIG.SITE_INFO.rootDirAssets && /^\/assets\//.test(srcPath)) {
      filePath = path.resolve(CONFIG.path.distAssets, srcPath.slice(1))
    } else if (/^\//.test(srcPath)) {
      filePath = path.resolve(CONFIG.path.dist, srcPath.slice(1))
    } else {
      filePath = path.resolve(file.dirname, srcPath)
    }
    return fs.existsSync(filePath)
  },
  detectExistImage: (srcPath) => {
    try {
      let filePath
      if (/^\//.test(srcPath)) {
        filePath = path.resolve(CONFIG.path.src, srcPath.slice(1))
      } else {
        filePath = path.resolve(file.dirname, srcPath)
      }
      imageSize(filePath)
      return true
    } catch (error) {
      return false
    }
  },
  imageSize: (srcPath) => {
    let filePath
    if (/^\//.test(srcPath)) {
      filePath = path.resolve(CONFIG.path.src, srcPath.slice(1))
    } else {
      filePath = path.resolve(file.dirname, srcPath)
    }
    return imageSize(filePath)
  },
  svgSize: (srcPath) => {
    let filePath
    if (/^\//.test(srcPath)) {
      filePath = path.resolve(CONFIG.path.modules, srcPath.slice(1))
    } else {
      filePath = path.resolve(file.dirname, srcPath)
    }
    return imageSize(filePath)
  },
  getUniqueId: () => {
    return uniqueId++
  },
})

const disableLint = false

function pugPipe(src) {
  return src
    .pipe(gulpif(isDev, plumber(CONFIG.plumber)))
    .pipe(data(CONFIG.data(CONFIG.path.src, CONFIG.SITE_INFO, locals)))
    .pipe(
      gulpPug(
        CONFIG.pug({
          basedir: path.resolve(CONFIG.path.modules, 'pug'),
        })
      )
    )
    .pipe(gulpif(!disableLint, htmlhint(CONFIG.htmlhint)))
    .pipe(
      htmlBeautify({
        indent_size: 2,
        indent_inner_html: true,
        inline: ['br', 'span', 'em', 'strong', 'img'],
        content_unformatted: ['pre', 'script', 'noscript'],
        extra_liners: [],
      })
    )
    .pipe(htmlhint.reporter())
    .pipe(
      rename((path) => {
        const isPhpFile = isPhp && path.basename.endsWith('.php')
        path.basename = path.basename.replace('.php', '')
        if (isPhpFile) {
          path.extname = '.php'
        }
      })
    )
    .pipe(gulp.dest(CONFIG.path.dist))
}

function pug() {
  return pugPipe(gulp.src(CONFIG.path.pug))
}

function watchPug(cb) {
  const src = [CONFIG.path.pug, CONFIG.path.modules + '/**/*.pug']
  if (isExample) {
    src.push(CONFIG.path.modulesDefault + '/**/*.pug')
  }
  gulp.watch(src, gulp.series(pug, ...(isPhp ? [] : [demoPug])))
  cb()
}

function demoPug() {
  return pugPipe(gulp.src(CONFIG.path.demoPug))
}

function watchDemo(cb) {
  gulp.watch(CONFIG.path.demoPug, demoPug)
  cb()
}

exports.pug = pug
exports.watchPug = watchPug
exports.demoPug = demoPug
exports.watchDemo = watchDemo
