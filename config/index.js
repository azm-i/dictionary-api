// =============================================
// options
//
module.exports = {
  SITE_INFO: require('./site-info.js'),
  path: require('./path-env.js'),

  browsers: require('./browsers.js'),
  pug: require('./gulp-pug.js'),
  data: require('./gulp-data.js'),
  sass: require('./gulp-sass.js'),
  postcss: require('./gulp-postcss.js'),
  stylelint: require('./gulp-stylelint.js'),
  imagemin: require('./gulp-imagemin.js'),
  plumber: require('./gulp-plumber.js'),
  htmlhint: require('./gulp-htmlhint.js'),
  eslint: require('./gulp-eslint.js'),
  svgSymbols: require('./gulp-svg-symbols.js'),
  sitemap: require('./gulp-sitemap.js'),
  sftp: require('./gulp-sftp.js'),
  slack: require('./slack.js'),
}
