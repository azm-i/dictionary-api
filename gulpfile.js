const fs = require('fs')

if (fs.existsSync('.env')) {
  require('dotenv').config()
}

const gulp = require('gulp')
const del = require('del')
const browserSync = require('browser-sync').create()
const { cache } = require('./gulp/util')

const sitemap = require('gulp-sitemap')
const sftp = require('gulp-sftp')

const CONFIG = require('./config')

const { hashLink, slackMessage } = require('./gulp/util')
const { pug, watchPug, demoPug, watchDemo } = require('./gulp/pug')
const { sass, watchSass } = require('./gulp/sass')
const { js } = require('./gulp/js')
const {
  svgSymbols,
  watchSvg,
  image,
  watchImage,
  media,
  watchMedia,
  tinypng,
} = require('./gulp/media')
const { staticFiles, watchStaticFiles } = require('./gulp/static')
const { isPhp, isCache } = require('./param')

// =============================================
// sitemap
//
gulp.task('sitemap', () => {
  return gulp
    .src(CONFIG.path.dist + '/**/*.html')
    .pipe(sitemap(CONFIG.sitemap))
    .pipe(gulp.dest(CONFIG.path.dist))
})

// =============================================
// clean dir
//
function clean() {
  return del(CONFIG.path.distRoot)
}

function cleanCache() {
  return cache.clean()
}

function cleanWp() {
  return del(CONFIG.path.wpHtml)
}

// =============================================
// compile
//
const compile = gulp.parallel(
  pug,
  sass,
  js,
  image,
  gulp.series(svgSymbols, media),
  staticFiles
)

// =============================================
// watch
//
const watch = gulp.parallel(
  watchPug,
  watchDemo,
  watchSass,
  watchImage,
  watchSvg,
  watchMedia,
  watchStaticFiles
)

// =============================================
// serve
//
function serve(cb) {
  browserSync.init(
    {
      ...(isPhp
        ? {
            proxy: CONFIG.SITE_INFO.domainLocalPhpServer,
            files: CONFIG.path.distRoot,
          }
        : {
            server: CONFIG.path.distRoot,
            watch: true,
          }),
      watchEvents: ['add', 'change', 'unlink', 'addDir', 'unlinkDir'],
      startPath: CONFIG.SITE_INFO.rootDir,
      open: 'external',
      ghostMode: false,
      notify: false,
      ui: false,
    },
    cb
  )
}

// =============================================
// WordPress組み込み時の差分確認用
//
function wpHtml() {
  return gulp.src(CONFIG.path.dist + '/**').pipe(gulp.dest(CONFIG.path.wpHtml))
}

// =============================================
// build
//
const build = gulp.series(
  ...(isPhp || isCache ? [] : !isCache ? [cleanCache, clean] : [clean]),
  compile
)
const buildWp = gulp.series(cleanWp, build, wpHtml)

// =============================================
// deploy
//
gulp.task('deploy', gulp.parallel(build), () => {
  const hash = hashLink()

  slackMessage('warning', `今の ${hash} を mirko にあげますー。`)

  return gulp
    .src(CONFIG.path.dist + '/**')
    .pipe(sftp(CONFIG.sftp.mirko))
    .on('end', () => {
      slackMessage('good', `今の ${hash} を mirko にあげましたー。`)
    })
})

// =============================================
// gulp tasks
//
exports.build = build
exports.buildWp = buildWp
exports.tinypng = tinypng
exports.default = gulp.series(build, ...(isPhp ? [] : [demoPug]), serve, watch)
