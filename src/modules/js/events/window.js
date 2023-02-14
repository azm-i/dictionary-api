import { isMobile } from '~/utils/navigator'
import { debounce } from '~/utils/event'
import { emitScroll } from './scroll'

//
// 変数
//

const listenersResize = (window.sdListenersResize =
  window.sdListenersResize || [])

const listenersResizeAlways = (window.sdListenersResizeAlways =
  window.sdListenersResizeAlways || [])

const listenersResetSize = (window.sdListenersResetSize =
  window.sdListenersResetSize || [])

const listenersOrientationchange = (window.sdListenersOrientationchange =
  window.sdListenersOrientationchange || [])

window.sdWindowWidth = window.sdWindowWidth || 0

//
// main
//

export function init() {
  window.addEventListener('resize', () => {
    requestAnimationFrame(() => {
      emitResize()
    })
  })

  window.addEventListener('orientationchange', () => {
    const isHorizontal = window.orientation !== 0
    for (let i = 0; i < listenersOrientationchange.length; i++) {
      listenersOrientationchange[i](isHorizontal)
    }
  })
}

export function onResize(listener, isExecute) {
  if (isExecute) {
    requestAnimationFrame(() => {
      listener()
    })
  }
  listenersResize.push(listener)
}

export function offResize(listener) {
  listenersResize.some((value, i) => {
    if (value === listener) {
      listenersResize.splice(i, 1)
      return true
    }
    return false
  })
}

export function onResizeAlways(listener, isExecute) {
  if (isExecute) {
    requestAnimationFrame(() => {
      listener()
    })
  }
  listenersResizeAlways.push(listener)
}

export function offResizeAlways(listener) {
  listenersResizeAlways.some((value, i) => {
    if (value === listener) {
      listenersResizeAlways.splice(i, 1)
      return true
    }
    return false
  })
}

export function onResetSize(listener, isExecute) {
  if (isExecute) {
    requestAnimationFrame(() => {
      listener()
    })
  }
  listenersResetSize.push(listener)
}

export function offResetSize(listener) {
  listenersResetSize.some((value, i) => {
    if (value === listener) {
      listenersResetSize.splice(i, 1)
      return true
    }
    return false
  })
}

export function onOrientationchange(listener, isExecute) {
  if (isExecute) {
    requestAnimationFrame(() => {
      const isHorizontal = window.orientation !== 0
      listener(isHorizontal)
    })
  }
  listenersOrientationchange.push(listener)
}

export function offOrientationchange(listener) {
  listenersOrientationchange.some((value, i) => {
    if (value === listener) {
      listenersOrientationchange.splice(i, 1)
      return true
    }
    return false
  })
}

export const emitResize = debounce((isForce) => {
  for (let i = 0; i < listenersResizeAlways.length; i++) {
    listenersResizeAlways[i](isForce)
  }

  // モバイル端末でアドレスバーの高低切り替わり時はリサイズ処理しない
  if (!isForce && isMobile && window.sdWindowWidth === window.innerWidth) return
  window.sdWindowWidth = window.innerWidth

  for (let i = 0; i < listenersResetSize.length; i++) {
    listenersResetSize[i](isForce)
  }
  for (let i = 0; i < listenersResize.length; i++) {
    listenersResize[i](isForce)
  }

  emitScroll()
}, 100)
