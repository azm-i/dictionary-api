module.exports = (options = {}) => {
  const includePaths = []
  if (options.root) {
    includePaths.push(options.root)
  }

  return {
    outputStyle: 'expanded',
    includePaths,
  }
}
