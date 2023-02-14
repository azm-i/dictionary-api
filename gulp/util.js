const { execSync, spawn } = require('child_process')
const request = require('request')

// const cached = require('gulp-cached')
const cached = require('./plugin/cached')

const CONFIG = require('../config')
const { isExample, isTinypng } = require('../param')

const cacheFileName = isExample
  ? 'example'
  : isTinypng
  ? 'tinypng'
  : CONFIG.path.distRootName.replace(/\./g, '_')
function cache(categoryName) {
  return cached(cacheFileName, categoryName, { optimizeMemory: true })
}
cache.write = () => {
  return cached.write(cacheFileName)
}
cache.clean = () => {
  return cached.clean(cacheFileName)
}

function slackMessage(type, message) {
  const url = CONFIG.slack.url
  const body = Object.assign({}, CONFIG.slack, {
    attachments: [
      {
        color: type,
        mrkdwn_in: ['fields'],
        fields: [
          {
            value: message,
          },
        ],
      },
    ],
  })
  delete body.url

  request({
    url,
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function hashLink() {
  const urlPre = ''
  const hash = String(execSync('git rev-parse --short HEAD')).trim()
  return `<${urlPre}${hash}|${hash}>`
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    let error

    spawn(command, args, {
      shell: true,
      stdio: 'inherit',
    })
      .on('error', (err) => {
        error = err
      })
      .on('exit', (code) => {
        if (code !== 0 || error) {
          reject(error || 'Unknown error')
        } else {
          resolve()
        }
      })
  })
}

exports.cache = cache
exports.slackMessage = slackMessage
exports.hashLink = hashLink
exports.run = run
