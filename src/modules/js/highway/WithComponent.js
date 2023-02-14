import Highway from '@dogstudio/highway'
// import Highway from '~/vendors/highway/highway'
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
// state
//

const state = {
  isPullAddressBar: false,
}

//
// main
//

export default class WithComponent extends Highway.Transition {
  // isMenu = false

  out({ from, done }) {
    // this.isMenu = this.name === 'menu'
    state.isPullAddressBar =
      isMobile &&
      !store.isOpenModal &&
      window.innerHeight > store.windowHeightInitial

    // 遷移時に非表示にする要素
    const elsTransitionHidden = [
      from,
      document.querySelectorAll('[data-transition-hidden]'),
    ]

    eventBus.once('leaveEnd', () => {
      // 前ページ非表示
      gsap
        .set(elsTransitionHidden, {
          opacity: 0,
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
    })
  }

  async in({ to, done }) {
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
    const promiseShowPage = new Promise((resolve) => {
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

              setTimeout(() => {
                isReadyPage = true
                check()
              }, 300)
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

        return gsap.set(elsTransitionHidden, {
          opacity: 1,
          visibility: 'visible',
        })
      })

      // ページ初期アニメーション発火
      .then(() => {
        emitEnterShow()
      })

    const promiseTransitionEnd = new Promise((resolve) => {
      eventBus.once('enterEnd', resolve)
    })

    await Promise.all([promiseShowPage, promiseTransitionEnd])
    emitResize(true)
    done()
  }
}

export function showPage() {
  gsap.set(document.querySelectorAll('[data-transition-hidden]'), {
    opacity: 1,
    visibility: 'visible',
  })
}
