// import LocomotiveScroll from 'locomotive-scroll'
import LocomotiveScroll from '~/vendors/locomotive-scroll/locomotive-scroll'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import Component from '~/parentClass/Component'
import { isIE } from '~/utils/navigator'
import passive from '~/utils/passive'
import store from '~/managers/store'
import media from '~/utils/media'
import eventBus from '~/events/eventBus'
import { allowScroll, preventScroll } from '~/utils/scroll'
import { debounce } from '~/utils/event'

//
// パラメーター
//

const param = {
  smooth: !isIE,
  duration: 1,
  ease: [0.25, 0.0, 0.35, 1.0],
  easeGsap: 'power2.easeOut',
  lerp: location.search.split('?smooth=')[1] === 'false' ? 1 : 0.11,
  multiplier: 1.2,
  mouseMultiplier: 0.5,
}
param.smooth = process.env.enableSmoothScroll && param.smooth

//
// 定数
//

const CLASS_NAME = '-view'

// GSAP 3のscrollToを有効化
gsap.registerPlugin(ScrollToPlugin)

//
// main
//

export default class ScrollLocomotive extends Component {
  _scroll
  _callbackScroll
  listenersAnimateScroll = []
  listenersResizeSelf = []
  _callbackListCall = []
  isDisable = false
  isSmooth = false

  constructor(option = {}) {
    const {
      el = document.querySelector('[data-scroll-container]'),
      disableHash = false,
    } = option
    super({ el, isPermanent: true })

    if (!el) {
      this.isDisable = true
      return
    }

    const { smooth, lerp, mouseMultiplier, multiplier } = param

    const direction = el.dataset.scrollContainerDirection || 'vertical'
    this.isHorizontal = direction === 'horizontal'
    this.coordinate = this.isHorizontal ? 'x' : 'y'
    const gestureDirection = this.isHorizontal ? 'both' : 'vertical'

    requestAnimationFrame(() => {
      this._scroll = new LocomotiveScroll({
        el,
        smooth,
        direction,
        gestureDirection,
        lerp,
        mouseMultiplier,
        class: CLASS_NAME,
        multiplier,
        disableHash,
      })

      // ページバック時は遷移前のスクロール位置を復元
      // const scrollY = (this.scrollYSmoothOwn = store.scrollY =
      //   (store.isTransitioned && store.isPopstate) ||
      //   (!store.isTransitioned && getNavigationType() !== 'default')
      //     ? Number(sessionStorage.getItem(this._getStorageName())) || 0
      //     : 0)
      // if (scrollY > 0) {
      //   requestAnimationFrame(() => {
      //     this.scrollToFast(scrollY, { disableOffset: true })
      //   })
      // }

      // 常にスクロール位置を一番上にする
      // this.scrollYSmoothOwn = store.scrollY = 0
      // requestAnimationFrame(() => {
      //   this.scrollToFast(0, { disableOffset: true })
      // })

      this._updateIsSmooth()

      this._addEventListener()

      eventBus.emit('initCScroll')
    })
  }

  init() {
    this._scroll.init()
  }

  scrollTo(target = 0, option = {}) {
    if (!this._scroll) return

    const {
      isFast = false,
      duration = isFast ? 0.0001 : param.duration,
      autoKill = false,
      disableOffset = false,
      disableLerp = isFast,
      ease = param.ease,
    } = option
    const offset = disableOffset ? 0 : this._getOffsetY()

    const onComplete = () => {
      this.scrollYSmoothOwn = store.scrollY = this._scroll.scroll.instance.scroll.y
      this.update()
      if (option.onComplete) {
        option.onComplete()
      }
    }

    if (!this.isSmooth) {
      if (target === window.pageYOffset && onComplete) {
        // ターゲットと現在のスクロール位置が同じとき
        onComplete()
      } else if (isFast) {
        // スムーススクロールが無効かつscrollToFastを実行したとき
        if (typeof target === 'string') {
          // Selector or boundaries
          if (target === 'top') {
            target = this.html
          } else if (target === 'bottom') {
            target = this.html.offsetHeight - window.innerHeight
          } else {
            target = document.querySelector(target)
            // If the query fails, abort
            if (!target) {
              return
            }
          }
        } else if (typeof target === 'number') {
          // Absolute coordinate
          target = parseInt(target)
        } else if (target && target.tagName) {
          // DOM Element
          // We good 👍
        } else {
          console.warn('`target` parameter is not valid')
          return
        }

        // We have a target that is not a coordinate yet, get it
        let top
        if (typeof target !== 'number') {
          top =
            target.getBoundingClientRect().top +
            offset +
            this._scroll.scroll.instance.scroll.y
        } else {
          top = target + offset
        }
        window.scrollTo({
          top,
        })
        onComplete()
      } else {
        // スムーススクロールが無効のとき
        store.isScrollAnimating = true
        gsap.killTweensOf(window, { scrollTo: true })
        gsap.to(window, {
          scrollTo: {
            [this.coordinate]: target,
            [this.isHorizontal ? 'offsetX' : 'offsetY']: offset,
            autoKill,
          },
          duration,
          ease: disableLerp ? 'none' : param.easeGsap,
          onComplete: () => {
            store.isScrollAnimating = false
            onComplete()
          },
        })
      }
    } else {
      // スムーススクロールが有効のとき
      store.isScrollAnimating = true
      this._scroll.scrollTo(target, {
        offset,
        duration: duration * 1000,
        easing: isFast ? null : ease || param.ease,
        callback: () => {
          store.isScrollAnimating = false
          onComplete()
        },
        disableLerp,
      })
    }
  }

  scrollToId(id, option) {
    const target = id === 'top' ? 0 : `#${id}`
    this.scrollTo(target, option)
  }

  scrollToFast(target, option = {}) {
    option.isFast = true
    this.scrollTo(target, option)
  }

  scrollToAnchor(option) {
    if (location.hash) {
      const id = location.hash.slice(1, location.hash.length)
      const target = document.getElementById(id)
      return this.scrollTo(target || 0, option)
    } else {
      // スクロール位置をページ一番上にする
      return this.scrollTo(0, option)
    }
  }

  scrollToPrevPagePosition(option = {}) {
    option.disableOffset = true
    return this.scrollToFast(this.getStorageScrollY(), option)
  }

  onAnimateScroll(listener) {
    this.listenersAnimateScroll.push(listener)
  }

  offAnimateScroll(listener) {
    this.listenersAnimateScroll.some((value, i) => {
      if (value === listener) {
        this.listenersAnimateScroll.splice(i, 1)
        return true
      }
      return false
    })
  }

  addCall(callback) {
    if (this.isDisable) return

    this._callbackListCall.push(callback)
  }

  removeCall(callback) {
    if (this.isDisable) return

    this._callbackListCall.some((value, i) => {
      if (value === callback) {
        this._callbackListCall.splice(i, 1)
        return true
      }
      return false
    })
  }

  update() {
    if (this.isDisable || !this._scroll) return

    this._scroll.update()
  }

  start() {
    if (this.isDisable || !this._scroll) return

    this._scroll.start()
    allowScroll()
  }

  stop() {
    if (this.isDisable || !this._scroll) return

    this._scroll.stop()
    preventScroll()
  }

  _updateIsSmooth() {
    if (!this._scroll) return

    const context = this._scroll[this._scroll.scroll.context]
    this.isSmooth = context ? context.smooth : this._scroll.smooth
    document.documentElement.classList[this.isSmooth ? 'remove' : 'add'](
      'sDisableSmoothScroll'
    )
  }

  onResize(isForce) {
    if (this.isDisable || !this._scroll) return

    this._scroll.scroll.resize()
    this._updateIsSmooth()

    this.el.style.willChange = this.isSmooth ? 'transform' : 'auto'

    requestAnimationFrame(() => {
      this.update()
    })
  }

  onResizeSelf(listener) {
    this.listenersResizeSelf.push(listener)
  }

  onceResizeSelf(listener) {
    const _listener = () => {
      this.offResizeSelf(_listener)
      listener()
    }
    this.onResizeSelf(_listener)
  }

  offResizeSelf(listener) {
    this.listenersResizeSelf.some((value, i) => {
      if (value === listener) {
        this.listenersResizeSelf.splice(i, 1)
        return true
      }
      return false
    })
  }

  setResizeObserver() {
    const { el } = this
    const handleResize = debounce(() => {
      for (let i = 0; i < this.listenersResizeSelf.length; i = (i + 1) | 0) {
        this.listenersResizeSelf[i]()
      }
    }, 300)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === el) {
          handleResize()
        }
      }
    })
    resizeObserver.observe(el)
  }

  _getOffsetY() {
    const elFixed = document.querySelector(
      `[data-anchor-offset="${media.isSp ? 'sp' : 'pc'}"]`
    )
    return elFixed ? -elFixed.getBoundingClientRect().bottom : 0
  }

  _addEventListener() {
    this._callbackScroll = (obj) => {
      const yPrev = this.scrollYSmoothOwn
      const y = (this.scrollYSmoothOwn = store.scrollY =
        obj.scroll[this.coordinate])
      const yDiff = y - yPrev
      for (let i = 0; i < this.listenersAnimateScroll.length; i++) {
        this.listenersAnimateScroll[i](y, obj, yDiff)
      }

      // スムーススクロール無効時もパララックスが動くようにする (data-scroll-speed-native)
      if (!this.isSmooth) {
        const keys = Object.keys(obj.currentElements)
        for (let i = 0; i < keys.length; i++) {
          const { el, progress } = obj.currentElements[keys[i]]
          if ('scrollSpeedNative' in el.dataset) {
            el.style.transform = `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,${-(
              progress *
              Number(el.dataset.scrollSpeedNative || el.dataset.scrollSpeed) *
              40
            )},0,1)`
          }
        }
      }

      if (process.env.idPerfectPixel && this.isSmooth) {
        const elPerfectPixel = document.getElementById(
          process.env.idPerfectPixel
        )
        if (elPerfectPixel) {
          elPerfectPixel.style.transform = `translate3d(0,${-y}px,0)`
        }
      }
    }
    this._scroll.on('scroll', this._callbackScroll)

    this._callbackCall = (value, way, obj) => {
      for (let i = 0; i < this._callbackListCall.length; i++) {
        this._callbackListCall[i](value, way, obj)
      }
    }
    this._scroll.on('call', this._callbackCall)

    // 遷移前にスクロール位置を保存
    window.addEventListener('pagehide', () => {
      sessionStorage.setItem(
        this._getStorageName(),
        this._scroll.scroll.instance.scroll[this.coordinate]
      )
    })

    // NOTE: IE等慣性スクロール無効かつ横スクロール時にマウスホイール縦操作でもスクロールできるようにする
    if (!this.isSmooth && this.isHorizontal) {
      this.el.addEventListener(
        'wheel',
        ({ deltaY }) => {
          this.el.scrollBy(deltaY, 0)
        },
        passive
      )
    }
  }

  _getStorageName() {
    return 'scrollY-' + store.pageId
  }

  setStorageScrollY() {
    sessionStorage.setItem(this._getStorageName(), this.scrollYSmoothOwn)
  }

  getStorageScrollY() {
    return (
      Number(sessionStorage.getItem(this._getStorageName())) ||
      location.hash ||
      0
    )
  }

  onLeave() {
    this.setStorageScrollY()
  }

  onDestroy() {
    this._scroll.off('scroll', this._callbackScroll)
    this._scroll.off('call', this._callbackCall)
    this._scroll.destroy()

    this._scroll = null
    this._callbackScroll = null
    this.listenersAnimateScroll = []
    this.listenersResizeSelf = []
    this._callbackListCall = []

    super.onDestroy()
  }
}
