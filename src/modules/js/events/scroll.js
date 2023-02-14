import passive from '~/utils/passive'
import { throttle } from '~/utils/event'

//
// 変数
//

const listenersScroll = (window.sdListenersScroll =
  window.sdListenersScroll || [])
let lengthListenersScroll

//
// main
//

export function init() {
  window.addEventListener('scroll', emitScroll, passive)
}

export function onScroll(listener, isExecute) {
  if (isExecute) {
    setTimeout(() => {
      listener(window.scrollY)
    })
  }
  listenersScroll.push(listener)
}

export function offScroll(listener) {
  listenersScroll.some((value, i) => {
    if (value === listener) {
      listenersScroll.splice(i, 1)
      return true
    }
    return false
  })
}

export const emitScroll = throttle(() => {
  const { scrollY } = window

  lengthListenersScroll = listenersScroll.length
  for (let i = 0; i < lengthListenersScroll; i++) {
    listenersScroll[i](scrollY)
  }
}, 100)
