import eventBus from '~/events/eventBus'
import store from '~/managers/store'
import { initComponents } from '~/managers/components'

let initAsynchronousTransitionEachPage
if (process.env.enableEventAsynchronousTransition) {
  ;({
    initAsynchronousTransitionEachPage,
  } = require('~/events/asynchronousTransition'))
}

//
// main
//

/**
 * 非同期遷移初期化
 */
export function initAsynchronousTransition() {
  if (process.env.enableEventAsynchronousTransition) {
    initAsynchronousTransitionEachPage()
  }
}

/**
 * どのページでも常に存在する要素内の汎用コンポーネント処理
 * @param {string} [selector='[data-permanent]']
 */
export function initPermanentComponents(selector = '[data-permanent]') {
  document.querySelectorAll(selector).forEach((el) => {
    initComponents(el, true)
  })
}

/**
 * ページ毎にコンポーネントの初期化をする
 * @param {Document} [context=document.querySelector('[data-router-view]')]
 */
export function initEachPage(context = document) {
  initComponents(context)

  // ページ固有JS初期化
  eventBus.emit('initPageJs')
}

/**
 * 現在のページIDを取得
 * @param {Document} [context=document]
 */
export function setPageId(context = document) {
  // 前ページのIDを保持
  store.pageIdPrev = sessionStorage.getItem('pageId')

  // 次ページのIDを取得
  const pageId = (store.pageId = context.body.id)

  // 次ページのIDをセッションストレージに保持
  sessionStorage.setItem('pageId', pageId)

  // そのページ固有のJSファイルが存在するかどうか
  store.isPageJs = !!context.querySelector('script[data-reload]')
}
