const browserslist = require('browserslist')

const list = browserslist()

function getSupportIe() {
  return list.some((browser) => browser.match(/^ie\b/i))
}

module.exports = {
  list,
  isSupportIe: getSupportIe(),
}
