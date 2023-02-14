const through = require('through2')

module.exports = () => {
  return through.obj((file, encoding, callback) => {
    callback(null, file)
  })
}
