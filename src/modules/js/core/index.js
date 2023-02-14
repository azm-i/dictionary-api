import 'what-input'

import '~/core/polyfill'
import '~/core/gsap'
import initEvents from '~/core/event'

import { emitResize } from '~/events/window'
import {
  setPageId,
  initEachPage,
  initPermanentComponents,
  initAsynchronousTransition,
} from '~/events/page'
import eventBus from '~/events/eventBus'

import store from '~/managers/store'
import '~/managers/navigator'
import '~/managers/modal'
import { addComponents } from '~/managers/components'

import { onLoad } from '~/utils/event'
import { isSpMatch } from '~/utils/media'

//
// main
//
export default function init({
  Scroll,
  permanentComponents,
  components,
  transitions,
}) {
  initEvents({ transitions })

  setPageId()

  // 100vhにしている要素
  const el100vh = document.querySelector('[data-100vh]')

  // Typekit読み込み完了後
  // eventBus.once('activeTypekit', () => {
  //   store.isActiveTypekit = true
  // })

  if (store.isPageJs) {
    // ページ固有のJSが存在する場合は、そのJS読み込み後にメインの初期化をする
    eventBus.once('readyPage', detect100vh)
  } else {
    detect100vh()
  }

  // 初期化
  function initMain() {
    addComponents(components)

    // 全ページ共通コンポーネント
    // new CLazy()
    store.cScroll = new Scroll()
    permanentComponents.forEach((Class) => {
      new Class()
    })

    // 非同期遷移初期化
    if (process.env.enableEventAsynchronousTransition) {
      initPermanentComponents()

      // 非同期遷移による書き換え対象内の汎用コンポーネント
      initEachPage(document.querySelector('[data-router-view]'))

      initAsynchronousTransition()
    } else {
      initEachPage()
    }

    if (store.cScroll.fireViewSelf) {
      store.cScroll.fireViewSelf()
    }

    store.cScroll.onResizeSelf(() => {
      emitResize(true)
    })
    store.cScroll.onceResizeSelf(() => {
      // URLハッシュのアンカーリンク位置へスクロールさせる
      store.cScroll.scrollToAnchor({ isFast: true })
      eventBus.emit('resizeFirst')
    })

    // 画像読み込み後に高さが変わる場合があるので強制リサイズする
    onLoad(() => {
      emitResize(true)
      store.cScroll.setResizeObserver()
      eventBus.emit('loaded')
    })

    // PC/SPの表示が切り替わったら、バグで崩れないようにリロードする
    isSpMatch(location.reload, location.reload)
  }

  // 100vhにしている要素の高さが正常値になるまでinitを遅延させる（スマホ対策）
  function detect100vh() {
    if (!el100vh || (el100vh && el100vh.clientHeight > 0)) {
      initMain()
    } else {
      requestAnimationFrame(() => {
        detect100vh()
      })
    }
  }
}
