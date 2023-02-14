const { isExample } = require('../param')

const protocol = 'https'
const domain = '' // 'example.com'
const domainLocalPhpServer = '' // 'http://example.local/'
const rootDir = '/' // '/subdirectory/'
const rootDirAssets = '' // '/assets-subdirectory/'
const GA_ID = null // 'UA-111111111-1'
const GTM_ID = null // 'GTM-AAAAAAA'

module.exports = {
  protocol,
  domain,
  domainLocalPhpServer,
  rootDir: isExample ? '/example/' : rootDir,
  rootDirAssets,
  GA_ID,
  GTM_ID,
}
