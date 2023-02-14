import Highway from '@dogstudio/highway'
// import Highway from '~/vendors/highway/highway'
import { listen } from 'quicklink'
import eventBus from '~/events/eventBus'
import store from '~/managers/store'

import { destroyComponents } from '~/managers/components'
import { isIE } from '~/utils/navigator'
import { setPageId } from '~/events/page'
import { getPreloadImagePath } from '~/utils/dom'

//
// 定数
//

const CLASS_NAME_WAIT = 'sWait'
const CLASS_NAME_TRANSITION = 'sTransition'

//
// 変数
//

const listenersLeave = (window.sdListenersLeave = window.sdListenersLeave || [])
const listenersLeaveCompleted = (window.sdListenersLeaveCompleted =
  window.sdListenersLeaveCompleted || [])
const listenersEnter = (window.sdListenersEnter = window.sdListenersEnter || [])
const listenersEnterReady = (window.sdListenersEnterReady =
  window.sdListenersEnterReady || [])
const listenersEnterShow = (window.sdListenersEnterShow =
  window.sdListenersEnterShow || [])
const listenersEnterCompleted = (window.sdListenersEnterCompleted =
  window.sdListenersEnterCompleted || [])
const listenersLeaveCancelled = (window.sdListenersLeaveCancelled =
  window.sdListenersLeaveCancelled || [])
const listenersEnterCancelled = (window.sdListenersEnterCancelled =
  window.sdListenersEnterCancelled || [])

//
// state
//

const state = (window.sdPageState = window.sdPageState || {
  highway: null,
  documentTo: null,
  isDisable: !process.env.enableEventAsynchronousTransition || isIE, // IEでは非同期遷移無効
  isEnter: false,
})

//
// main
//

/**
 * 初期化
 */
export function init(transitions) {
  if (state.isDisable) return

  // ブラウザバックしたときに自動でスクロール位置が復元されるのを防ぐ
  history.scrollRestoration = 'manual'

  const highway = (state.highway = new Highway.Core({
    transitions,
  }))

  highway.on('NAVIGATE_OUT', ({ from, trigger, location }) => {
    // 非同期遷移中、またはモーダル開いてるときに前へ戻るしたらリロード
    if (store.isTransition) {
      if (state.isEnter) {
        emitEnterCancelled()
      } else {
        emitLeaveCancelled()
      }

      end()

      // 遷移アニメーション中にブラウザ戻ったら、バグを防ぐためリロードする
      window.location.reload()
      return
    }

    // モーダル開いているときにブラウザ戻ったら、バグを防ぐためリロードする
    // if (store.isOpenModal && trigger === 'popstate') {
    //   window.location.reload()
    //   return
    // }

    store.isTransitioned = true

    start(trigger)
  })

  highway.on('NAVIGATE_IN', ({ to, trigger, location }) => {
    store.isLeave = false
    state.isEnter = true

    state.documentTo = to.page

    setPageId(to.page)

    document.body.id = store.pageId

    store.isPopstate = trigger === 'popstate'

    emitEnter()
  })

  highway.on('NAVIGATE_END', ({ to, from, trigger, location }) => {
    initAsynchronousTransitionEachPage(to.page, to.view)

    emitEnterCompleted()

    end()
  })

  eventBus.on('addCursorWait', addCursorWait)
  eventBus.on('removeCursorWait', removeCursorWait)
}

/**
 * start
 */
function start(trigger) {
  store.isTransition = true
  store.isLeave = true

  document.documentElement.classList.add(CLASS_NAME_TRANSITION)

  // マウスポインターをローディング表示にする
  addCursorWait()

  emitLeave(trigger)
}

/**
 * end
 */
function end() {
  // マウスポインターのローディング表示解除
  removeCursorWait()

  requestAnimationFrame(() => {
    store.isTransition = false
    state.isEnter = false

    document.documentElement.classList.remove(CLASS_NAME_TRANSITION)
  })
}

/**
 * destroy
 */
export function destroy() {
  eventBus.emit('destroy')

  destroyComponents()
}

/**
 * ページ毎に非同期遷移の初期化をする
 * @param {Document} [context=document]
 * @param {Element} [el]
 */
export function initAsynchronousTransitionEachPage(
  context = document,
  el = context
) {
  // 非同期遷移の場合にGAのページビューイベントを送信
  if (process.env.enableAutoSendGaView) {
    sendGaView(context.title)
  }

  // 非同期遷移対象外のリンク設定
  detachInvalidATag()

  // リンクのプリフェッチ設定
  listenPrefetch(el)
}

/**
 * プリフェッチ
 * @param {Element} [el]
 */
export function listenPrefetch(el) {
  listen(
    el
      ? {
          el,
        }
      : null
  )
}

/**
 * 指定要素をHighwayリンクの対象にする
 * @param {Array|NodeList} elements
 */
export function attachLink(elements) {
  if (state.isDisable) return

  state.highway.attach(elements)
}

/**
 * 指定要素をHighwayリンクの対象外にする
 * @param {Array|NodeList} elements
 */
export function detachLink(elements) {
  if (state.isDisable) return

  state.highway.detach(elements)
}

/**
 * href属性を持たないaタグと、ページトップへ戻るリンクをHighwayリンクの対象外にする
 */
export function detachInvalidATag(context = document) {
  if (state.isDisable) return
  const path = location.pathname
  detachLink(
    context.querySelectorAll(
      'a:not([href]), a[href^="#"], a[href^="' + path + '#"]'
    )
  )
}

/**
 * GAのページビューイベント送信
 */
export function sendGaView(title) {
  if (GA_ID && typeof gtag !== 'undefined') {
    gtag('config', GA_ID, {
      page_path: location.pathname,
      page_title: title,
      page_location: location.href,
    })
    // } else if (GTM_ID && window.dataLayer) {
    //   if (!store.isTransitioned) return
    //   dataLayer.push(
    //     {
    //       event: 'gtm.js',
    //       'gtm.start': new Date().getTime(),
    //     },
    //     {
    //       event: 'gtm.dom',
    //     },
    //     {
    //       event: 'gtm.load',
    //     }
    //   )
  }
}

/**
 * マウスポインターをウェイティング表示にする
 */
function addCursorWait() {
  document.documentElement.classList.add(CLASS_NAME_WAIT)
}

/**
 * マウスポインターのウェイティング表示を解除
 */
function removeCursorWait() {
  document.documentElement.classList.remove(CLASS_NAME_WAIT)
}

/**
 * ページ固有CSS置換
 */
export function manageStyles() {
  // Your main css file, used to prepend other styles
  const main = document.querySelector('#main-style')

  const styleListTo = [
    ...state.documentTo.querySelectorAll(
      'style[data-reload], link[data-reload]'
    ),
  ]
  const styleListFrom = [
    ...document.querySelectorAll('style[data-reload], link[data-reload]'),
  ]

  // Compare Styles
  for (let i = 0; i < styleListFrom.length; i++) {
    const styleFrom = styleListFrom[i]

    for (let j = 0; j < styleListTo.length; j++) {
      const styleTo = styleListTo[j]

      if (styleFrom.outerHTML === styleTo.outerHTML) {
        // Create Shadow Style
        const style = document.createElement(styleFrom.tagName)

        // Loop Over Attributes
        for (let k = 0; k < styleFrom.attributes.length; k++) {
          // Get Attribute
          const attr = styleFrom.attributes[k]

          // Set Attribute
          style.setAttribute(attr.nodeName, attr.nodeValue)
        }

        // Style Tag
        if (styleFrom.tagName === 'STYLE') {
          if (styleFrom.innerHTML) {
            style.innerHTML = styleFrom.innerHTML
          }
        }

        // Replace
        styleFrom.parentNode.replaceChild(style, styleFrom)

        // Clean Arrays
        styleListFrom.splice(i, 1)
        styleListTo.splice(j, 1)

        // Exit Loop
        break
      }
    }
  }

  // Remove Useless
  for (const styleFrom of styleListFrom) {
    // Remove
    styleFrom.parentNode.removeChild(styleFrom)
  }

  // Add Styles
  for (const styleTo of styleListTo) {
    // Create Shadow Style
    const style = document.createElement(styleTo.tagName)

    // Loop Over Attributes
    for (let k = 0; k < styleTo.attributes.length; k++) {
      // Get Attribute
      const attr = styleTo.attributes[k]

      // Set Attribute
      style.setAttribute(attr.nodeName, attr.nodeValue)
    }

    // Style Tag
    if (styleTo.tagName === 'STYLE') {
      if (styleTo.innerHTML) {
        style.innerHTML = styleTo.innerHTML
      }
    }

    const loc = styleTo.parentNode.tagName

    if (loc === 'HEAD') {
      document.head.insertBefore(style, main)
    }

    if (loc === 'BODY') {
      document.body.appendChild(style)
    }
  }
}

/**
 * ページ固有JS置換
 */
export function manageScripts() {
  // Your main JS file, used to prepend other scripts
  const main = document.querySelector('#main-script')

  const scriptListTo = [
    ...state.documentTo.querySelectorAll('script[data-reload]'),
  ]
  const scriptListFrom = [...document.querySelectorAll('script[data-reload]')]

  // Compare Scripts
  for (let i = 0; i < scriptListFrom.length; i++) {
    const scriptFrom = scriptListFrom[i]

    for (let j = 0; j < scriptListTo.length; j++) {
      const scriptTo = scriptListTo[j]

      if (scriptFrom.outerHTML === scriptTo.outerHTML) {
        // Create Shadow Script
        const script = document.createElement(scriptFrom.tagName)

        // Loop Over Attributes
        for (let k = 0; k < scriptFrom.attributes.length; k++) {
          // Get Attribute
          const attr = scriptFrom.attributes[k]

          // Set Attribute
          script.setAttribute(attr.nodeName, attr.nodeValue)
        }

        // Inline Script
        if (scriptFrom.innerHTML) {
          script.innerHTML = scriptFrom.innerHTML
        }

        // Replace
        scriptFrom.parentNode.replaceChild(script, scriptFrom)

        // Clean Arrays
        scriptListFrom.splice(i, 1)
        scriptListTo.splice(j, 1)

        // Exit Loop
        break
      }
    }
  }

  // Remove Useless
  for (const scriptFrom of scriptListFrom) {
    // Remove
    scriptFrom.parentNode.removeChild(scriptFrom)
  }

  // Add Scripts
  for (const scriptTo of scriptListTo) {
    // Create Shadow Script
    const script = document.createElement(scriptTo.tagName)

    // Loop Over Attributes
    for (let k = 0; k < scriptTo.attributes.length; k++) {
      // Get Attribute
      const attr = scriptTo.attributes[k]

      // Set Attribute
      script.setAttribute(attr.nodeName, attr.nodeValue)
    }

    // Inline Script
    if (scriptTo.innerHTML) {
      script.innerHTML = scriptTo.innerHTML
    }

    const loc = scriptTo.parentNode.tagName

    if (loc === 'HEAD') {
      document.head.appendChild(script)
    }

    if (loc === 'BODY') {
      document.body.insertBefore(script, main)
    }
  }
}

export function getPreloadImagePathToPage() {
  return getPreloadImagePath(state.documentTo)
}

export function emitLeave(trigger) {
  eventBus.emit('leave', store.pageId, trigger)
  listenersLeave.forEach((listener) => {
    listener(store.pageId)
  })
}

export function emitLeaveCompleted() {
  eventBus.emit('leaveCompleted', store.pageId, store.pageIdPrev)
  listenersLeaveCompleted.forEach((listener) => {
    listener(store.pageId, store.pageIdPrev)
  })
}

export function emitEnter() {
  eventBus.emit('enter', store.pageId, store.pageIdPrev)
  listenersEnter.forEach((listener) => {
    listener(store.pageId, store.pageIdPrev)
  })
}

export function emitEnterReady() {
  eventBus.emit('enterReady', store.pageId, store.pageIdPrev)
  listenersEnterReady.forEach((listener) => {
    listener(store.pageId, store.pageIdPrev)
  })
}

export function emitEnterShow() {
  eventBus.emit('enterShow', store.pageId, store.pageIdPrev)
  listenersEnterShow.forEach((listener) => {
    listener(store.pageId, store.pageIdPrev)
  })
}

export function emitEnterCompleted() {
  eventBus.emit('enterCompleted', store.pageId, store.pageIdPrev)
  listenersEnterCompleted.forEach((listener) => {
    listener(store.pageId, store.pageIdPrev)
  })
}

export function emitEnterCancelled() {
  eventBus.emit('enterCancelled', store.pageId)
  listenersEnterCancelled.forEach((listener) => {
    listener(store.pageId)
  })
}

export function emitLeaveCancelled() {
  eventBus.emit('leaveCancelled', store.pageId)
  listenersLeaveCancelled.forEach((listener) => {
    listener(store.pageId)
  })
}

export function onLeave(listener) {
  listenersLeave.push(listener)
}

export function offLeave(listener) {
  listenersLeave.some((value, i) => {
    if (value === listener) {
      listenersLeave.splice(i, 1)
      return true
    }
    return false
  })
}

export function onLeaveCompleted(listener) {
  listenersLeaveCompleted.push(listener)
}

export function offLeaveCompleted(listener) {
  listenersLeaveCompleted.some((value, i) => {
    if (value === listener) {
      listenersLeaveCompleted.splice(i, 1)
      return true
    }
    return false
  })
}

export function onEnter(listener) {
  listenersEnter.push(listener)
}

export function offEnter(listener) {
  listenersEnter.some((value, i) => {
    if (value === listener) {
      listenersEnter.splice(i, 1)
      return true
    }
    return false
  })
}

export function onEnterCompleted(listener) {
  listenersEnterCompleted.push(listener)
}

export function offEnterCompleted(listener) {
  listenersEnterCompleted.some((value, i) => {
    if (value === listener) {
      listenersEnterCompleted.splice(i, 1)
      return true
    }
    return false
  })
}

export function onLeaveCancelled(listener) {
  listenersLeaveCancelled.push(listener)
}

export function offLeaveCancelled(listener) {
  listenersLeaveCancelled.some((value, i) => {
    if (value === listener) {
      listenersLeaveCancelled.splice(i, 1)
      return true
    }
    return false
  })
}

export function onEnterCancelled(listener) {
  listenersEnterCancelled.push(listener)
}

export function offEnterCancelled(listener) {
  listenersEnterCancelled.some((value, i) => {
    if (value === listener) {
      listenersEnterCancelled.splice(i, 1)
      return true
    }
    return false
  })
}
