const path = require('path')
const { GA_ID, GTM_ID } = require('./site-info')

function empty() {
  return {}
}

module.exports = (src, siteInfo = {}, getOtherData = empty) => {
  const protocol = siteInfo.protocol || 'https'
  const domain = siteInfo.domain
  const rootDir = siteInfo.rootDir || '/'
  src = src || path.resolve(process.cwd(), 'src')

  return (file) => {
    const rootPath = domain ? `${protocol}://${domain}` : ''
    const filePath = file.path.replace(src, '')
    const pathInfo = path.parse(filePath)

    pathInfo.ext = '.html'
    pathInfo.base = ''

    const localPath = path.format(pathInfo).replace(/\\/g, '/')
    const localPathExcludeIndex = localPath
      .replace(/\/index\.html$/, '/')
      .replace(/\/index\.php\.html$/, '/')
      .replace(/\.php\.html$/, '.php')

    const otherData = getOtherData(file)

    return Object.assign(
      {
        SITE_CONF: siteInfo,
        ROOT_PATH: rootPath,
        PAGE_INFO: {
          local_path: localPathExcludeIndex,
          local_root_path: localPath.replace(/\/[\w\d_-]+?\.html$/, '/'),
          absolute_path: rootPath
            ? rootPath + rootDir.replace(/\/$/, '') + localPathExcludeIndex
            : '',
        },
        GA_ID,
        GTM_ID,
      },
      otherData
    )
  }
}
