import passive from '~/utils/passive'

//
// 変数
//

const listenersMousedown = (window.sdListenersMousedown =
  window.sdListenersMousedown || [])
let lengthListenersMousedown

const listenersMousemove = (window.sdListenersMousemove =
  window.sdListenersMousemove || [])
let lengthListenersMousemove

const listenersMouseup = (window.sdListenersMouseup =
  window.sdListenersMouseup || [])
let lengthListenersMouseup

//
// main
//

export function init() {
  document.addEventListener(
    'mousedown',
    (e) => {
      const { clientX, clientY } = e
      lengthListenersMousedown = listenersMousedown.length
      for (let i = 0; i < lengthListenersMousedown; i++) {
        listenersMousedown[i](clientX, clientY)
      }
    },
    passive
  )
  document.addEventListener(
    'mousemove',
    (e) => {
      const { clientX, clientY } = e
      lengthListenersMousemove = listenersMousemove.length
      for (let i = 0; i < lengthListenersMousemove; i++) {
        listenersMousemove[i](clientX, clientY)
      }
    },
    passive
  )
  document.addEventListener(
    'mouseup',
    (e) => {
      const { clientX, clientY } = e
      lengthListenersMouseup = listenersMouseup.length
      for (let i = 0; i < lengthListenersMouseup; i++) {
        listenersMouseup[i](clientX, clientY)
      }
    },
    passive
  )
}

export function onMousedown(listener) {
  listenersMousedown.push(listener)
}

export function offMousedown(listener) {
  listenersMousedown.some((value, i) => {
    if (value === listener) {
      listenersMousedown.splice(i, 1)
      return true
    }
    return false
  })
}

export function onMousemove(listener) {
  listenersMousemove.push(listener)
}

export function offMousemove(listener) {
  listenersMousemove.some((value, i) => {
    if (value === listener) {
      listenersMousemove.splice(i, 1)
      return true
    }
    return false
  })
}

export function onMouseup(listener) {
  listenersMouseup.push(listener)
}

export function offMouseup(listener) {
  listenersMouseup.some((value, i) => {
    if (value === listener) {
      listenersMouseup.splice(i, 1)
      return true
    }
    return false
  })
}
