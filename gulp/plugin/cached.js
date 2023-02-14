const fs = require('fs')
const del = require('del')
const crypto = require('crypto')
const defaults = require('lodash.defaults')
const through = require('through2')

const DEFAULT_FILE_NAME = 'cache'
const DEFAULT_CATEGORY_NAME = 'cache'
const CACHED_DIRECTORY_NAME = '.gulpCached'

const readFileSync = (fileName) => {
  try {
    return fs.readFileSync(fileName, 'utf8')
  } catch (err) {
    return undefined
  }
}

const writeFileSync = (fileName, data) => {
  try {
    return fs.writeFileSync(fileName, data, 'utf8')
  } catch (err) {
    const fileNames = fileName.split('/')
    const dirName = fileNames[0]
    if (dirName) {
      fs.mkdirSync(dirName, { recursive: true })
      return writeFileSync(fileName, data)
    } else {
      return undefined
    }
  }
}

const getFileName = (fileName = DEFAULT_FILE_NAME) => {
  return `${CACHED_DIRECTORY_NAME}/${fileName}.json`
}

const getCache = (fileName) => {
  const savedCache = readFileSync(getFileName(fileName))
  return savedCache ? JSON.parse(savedCache) : {}
}

let caches = {}
let isGetCache = false

const plugin = function(
  fileName,
  categoryName = DEFAULT_CATEGORY_NAME,
  opt = {}
) {
  const opts = defaults(opt, {
    optimizeMemory: false,
    autoWrite: false,
  })

  if (!isGetCache) {
    isGetCache = true
    caches = getCache(fileName)
  }

  if (!caches[categoryName]) {
    caches[categoryName] = {}
  }

  const stream = through.obj(function(file, enc, callback) {
    let contents = file.checksum

    if (!contents) {
      if (file.isStream()) {
        this.push(file)
        return callback()
      }
      if (file.isBuffer()) {
        contents = file.contents.toString('utf8')

        // slower for each file
        // but good if you need to save on memory
        if (opts.optimizeMemory) {
          contents = crypto
            .createHash('md5')
            .update(contents)
            .digest('hex')
        }
      }
    }

    const cacheFile = caches[categoryName][file.path]

    // hit - ignore it
    if (typeof cacheFile !== 'undefined' && cacheFile === contents) {
      callback()
      return
    }

    // miss - add it and pass it through
    caches[categoryName][file.path] = contents

    if (opts.autoWrite) {
      plugin.write()
    }

    this.push(file)
    callback()
  })
  return stream
}

plugin.write = (fileName) => {
  return writeFileSync(getFileName(fileName), JSON.stringify(caches))
}

plugin.clean = (fileName) => {
  caches = {}
  return del(getFileName(fileName))
}

module.exports = plugin
