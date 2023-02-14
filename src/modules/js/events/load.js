import store from '~/managers/store'
import { onLoad } from '~/utils/event'

//
// 変数
//

const listenersLoadProgress = (window.sdListenersLoadProgress =
  window.sdListenersLoadProgress || [])
let lengthListenersLoadProgress

const listenersLoadDone = (window.sdListenersLoadDone =
  window.sdListenersLoadDone || [])

//
// main
//

export function init() {
  if (process.env.enableEventPace) {
    const Pace = require('pace-js')

    // Paceライブラリ
    Pace.on('progress', (progress) => {
      lengthListenersLoadProgress = listenersLoadProgress.length
      for (let i = 0; i < lengthListenersLoadProgress; i++) {
        listenersLoadProgress[i](progress)
      }
    })

    Pace.once('done', (d) => {
      store.isLoadDone = true
      listenersLoadDone.forEach((listener) => {
        listener()
      })
    })

    Pace.start()
  } else {
    // window.onload
    onLoad(() => {
      store.isLoadDone = true
      listenersLoadDone.forEach((listener) => {
        listener()
      })
    })
  }
}

export function onLoadProgress(listener) {
  listenersLoadProgress.push(listener)
}

export function offLoadProgress(listener) {
  listenersLoadProgress.some((value, i) => {
    if (value === listener) {
      listenersLoadProgress.splice(i, 1)
      return true
    }
    return false
  })
}

export function onLoadDone(listener) {
  listenersLoadDone.push(listener)
}

export function offLoadDone(listener) {
  listenersLoadDone.some((value, i) => {
    if (value === listener) {
      listenersLoadDone.splice(i, 1)
      return true
    }
    return false
  })
}
