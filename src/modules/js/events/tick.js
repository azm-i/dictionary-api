//
// 定数
//

const FPS_BASE = 60

//
// 変数
//

const listenersTick = (window.sdListenersTick = window.sdListenersTick || [])

//
// main
//

export function init() {
  let timeLast = 0
  let count = 0
  let rateFps

  gsap.ticker.add((time) => {
    rateFps = (time - timeLast) * FPS_BASE

    for (let i = 0; i < listenersTick.length; i++) {
      listenersTick[i](time, count, rateFps)
    }

    timeLast = time
    count += 1
  })
}

export function onTick(listener) {
  listenersTick.push(listener)
}

export function offTick(listener) {
  listenersTick.some((value, i) => {
    if (value === listener) {
      listenersTick.splice(i, 1)
      return true
    }
    return false
  })
}
