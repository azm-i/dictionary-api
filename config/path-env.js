const path = require('path')
const SITE_INFO = require('./site-info')
const { isProd, isExample, isPhp } = require('../param')

const root = path.resolve(__dirname, '..')
const srcRootDefault = path.resolve(root, 'src')
const srcRoot = isExample ? path.resolve(root, 'example') : srcRootDefault
const src = path.resolve(srcRoot, 'www')
const modulesDefault = path.resolve(srcRootDefault, 'modules')
const modules = isExample ? path.resolve(srcRoot, 'modules') : modulesDefault
const distRootName = isPhp ? 'public' : isProd ? 'dist' : '.dist'
const distRoot = path.resolve(root, distRootName)
const dist = path.resolve(distRoot, SITE_INFO.rootDir.replace(/^\//, ''))

module.exports = {
  root,
  src,
  modules,
  modulesDefault,
  demoPug: path.resolve(srcRoot, 'demo/**/*.pug'),
  distRoot,
  distRootName,
  dist,
  distAssets: path.resolve(
    distRoot,
    SITE_INFO.rootDirAssets ? SITE_INFO.rootDirAssets.replace(/^\//, '') : dist
  ),
  static: path.resolve(srcRoot, 'static/**'),
  wpHtml: path.resolve(srcRoot, 'wp-html'),
  pug: path.resolve(src, '**/*.pug'),
  sass: path.resolve(src, '**/*.scss'),
  js: path.resolve(src, '**/*.(js|glsl)'),
  image: path.resolve(src, '**/*.+(jpg|jpeg|gif|png|webp)'),
  media: path.resolve(
    src,
    '**/*.+(svg|json|pdf|mp3|mp4|ico|woff|woff2|ttf|eot|map)'
  ),
  svgSymbols: path.resolve(src, 'assets/img/common'),
  tinypng: path.resolve(src, '**/*.+(jpg|jpeg|png)'),
}
