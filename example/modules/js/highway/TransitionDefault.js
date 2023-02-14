import Highway from '@dogstudio/highway'
// import Highway from '~/vendors/highway/highway'
import gsapK from '~/utils/gsapK'
import eventBus from '~/events/eventBus'
import { initEachPage } from '~/events/page'
import {
  destroy,
  manageStyles,
  manageScripts,
  getPreloadImagePathToPage,
  emitEnterShow,
  emitLeaveCompleted,
  emitEnterReady,
} from '~/events/asynchronousTransition'
import store from '~/managers/store'

import { getNavigationType, isMobile } from '~/utils/navigator'
import { emitResize } from '~/events/window'
import { resetStyleModal, setStyleModal } from '~/managers/modal'
import { loadImage } from '~/utils/dom'

//
// パラメーター
//

const param = {
  durationFadeShow: 0.8,
  durationFadeHide: 0.4,
  easeFadeShow: 'power2.out',
  easeFadeHide: 'power2.inOut',
}

//
// state
//

const state = {
  isPullAddressBar: false,
}

//
// main
//

export default class TransitionDefault extends Highway.Transition {
  // isMenu = false

  out({ from, done }) {
    this.isMenu = this.name === 'menu'
    console.log('isMenu:', this.isMenu)

    state.isPullAddressBar =
      isMobile &&
      !store.isOpenModal &&
      window.innerHeight > store.windowHeightInitial

    // 遷移時に非表示にする要素
    const elsTransitionHidden = [
      from,
      document.querySelectorAll('[data-transition-hidden]'),
    ]

    // 前ページ非表示
    gsapK
      .to(elsTransitionHidden, {
        opacity: 0,
        duration: param.durationFadeHide,
        ease: param.easeFadeHide,
      })
      .then(() => {
        emitLeaveCompleted()

        // destroy
        destroy()

        // 前ページ要素削除
        from.remove()

        // NOTE: 次のページへ遷移したときにスクロール位置が前のページの位置を保持してしまうため、遷移前に位置を更新する
        store.cScroll.scrollToFast(0, {
          onComplete: () => {
            if (state.isPullAddressBar) {
              // ページ遷移後にアドレスバーを表示させる
              setStyleModal()
            }

            // out完了
            requestAnimationFrame(() => {
              done()
            })
          },
        })
      })
  }

  in({ to, done }) {
    const { isPageJs } = store

    // 遷移時に非表示にする要素
    const elsTransitionHidden = [
      to,
      document.querySelectorAll('[data-transition-hidden]'),
    ]

    // 次ページを非表示にしておく
    gsap.set(elsTransitionHidden, {
      visibility: 'hidden',
      opacity: 0,
    })

    // 次のページの初期化
    new Promise((resolve) => {
      if (state.isPullAddressBar) {
        // ページ遷移後にアドレスバーを表示させる
        requestAnimationFrame(() => {
          resetStyleModal()
          resolve()
        })
      } else {
        resolve()
      }
    })

      .then(() => {
        const promisePage = new Promise((resolve) => {
          let isReadyPage = !isPageJs
          let isCompleteScroll = false

          // 次のページの初期化が完了したかチェック
          const check = () => {
            if (!(isReadyPage && isCompleteScroll)) return
            resolve()
          }

          if (isPageJs) {
            // ページ固有JS追加後の処理
            eventBus.once('readyPage', () => {
              initEachPage(to)

              requestAnimationFrame(() => {
                isReadyPage = true
                check()
              })
            })
          }

          // ページ固有CSS置換
          manageStyles()

          // ページ固有JS置換
          manageScripts()

          if (!isPageJs) {
            initEachPage(to)
          }

          isCompleteScroll = true
          check()
        })

        const promisePreloadImage = loadImage(getPreloadImagePathToPage())

        return Promise.all([promisePage, promisePreloadImage])
      })

      // スクロール位置変更
      .then(() => {
        return new Promise((resolve) => {
          emitResize(true)
          setTimeout(async () => {
            // リンククリックでの遷移時はスクロール位置を一番上にする
            if (
              (store.isTransitioned && !store.isPopstate) ||
              (!store.isTransitioned && getNavigationType() === 'default')
            ) {
              await store.cScroll.scrollToAnchor()
              resolve()
            } else {
              // ブラウザバックしたらスクロール位置を復元する
              await store.cScroll.scrollToPrevPagePosition()
              resolve()
            }
          }, 300)
        })
      })

      // 次ページ表示
      .then(() => {
        emitEnterReady()

        return gsapK.to(elsTransitionHidden, {
          opacity: 1,
          visibility: 'visible',
          duration: param.durationFadeShow,
          ease: param.easeFadeShow,
          onStart: () => {
            // 次ページ内要素のアニメーション開始
            emitEnterShow()
          },
        })
      })

      // in完了
      .then(done)
  }
}

export function showPage() {
  gsap.set(document.querySelectorAll('[data-transition-hidden]'), {
    opacity: 1,
    visibility: 'visible',
  })
}
