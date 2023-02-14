/**
 * サイトルートからのパスを取得する
 * @param {String} path パスの文字列
 * @return {string} サイトルートからのパスの文字列
 */
export function getFullPath(path) {
  let result
  if (process.env.rootDirAssets && /^\/assets\//.test(path)) {
    return process.env.rootDirAssets + path.slice(1)
  } else if (path.startsWith('http') || /^\/\//.test(path)) {
    result = path
  } else if (path === '/' || /^\/\S/.test(path)) {
    result = process.env.rootDir + path.slice(1)
  } else {
    result = path
  }
  return result
}
