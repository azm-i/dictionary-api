const pugIncludeGlob = require('pug-include-glob')

module.exports = (options = {}) => {
  return {
    doctype: 'html',
    pretty: '  ',
    basedir: options.basedir,
    // filters: options.filters,
    plugins: [pugIncludeGlob()],
  }
}
