import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import Component from '~/parentClass/Component'
import { isIE, isMobile } from '~/utils/navigator'
// import passive from '~/utils/passive'
import store from '~/managers/store'
import media from '~/utils/media'
import eventBus from '~/events/eventBus'
import { allowScroll, preventScroll } from '~/utils/scroll'
import { map } from '~/utils/math'
import { getComputedTransform, getVariableSize } from '~/utils/dom'
import { debounce } from '~/utils/event'
import { gsap } from 'gsap'
import gsapK from '~/utils/gsapK'

//
// パラメーター
//

const param = {
  smooth: !(
    isIE ||
    isMobile ||
    location.search.split('?smooth=')[1] === 'false'
  ),
  smoothSp: false,
  duration: 0.6,
  ease: [0.25, 0.0, 0.35, 1.0],
  easeGsap: 'power2.easeOut',
  lerp: 0.12,
  lerpDiff: 0.1,
  multiplier: 1.2,
  mouseMultiplier: 0.5,
}
param.smooth = process.env.enableSmoothScroll && param.smooth
param.smoothSp = param.smooth && param.smoothSp

const DIFF_SCROLL_Y_MAX = 20

//
// 定数
//

// GSAP 3のscrollToを有効化
gsap.registerPlugin(ScrollToPlugin)

//
// main
//

export default class Scroll extends Component {
  _callbackScroll
  listenersAnimateScroll = []
  listenersResizeSelf = []
  listenerIntersect = []
  _callbackListView = []
  isDisable = false
  isSmooth = false
  scrollYSmoothOwn = 0
  scrollYSmoothDest = 0
  scrollYNativeOwn = 0
  scrollYSwipeStart = 0
  scrollYPrev = 0
  diffScrollY = 0
  diffScrollYSmooth = 0
  dataParallax = []
  disableLerp = true
  isHorizonalScroll = false
  scrollMax = 0

  constructor(option = {}) {
    const { el = document.querySelector('[data-scroll-container]') } = option
    super({ el, isPermanent: true })

    if (!el) {
      this.isDisable = true
      return
    }

    this.scrollYSmoothOwn = this.scrollYSmoothDest = this.scrollYNativeOwn = store.scrollYNative = this.scrollYPrev = 0

    const direction = el.dataset.scrollContainer || 'vertical'
    this.isHorizontal = direction === 'horizontal'
    store.isHorizontalScroll = this.isHorizontal

    this._updateIsSmooth()

    if (this.isSmooth) {
      this._setScrollerSize()
    }

    this.setViewAll()
    this.setViewAll(true)

    // this.setResizeObserver()

    eventBus.emit('initCScroll')

    // this.scrollSwipeNow = 0
    // this.scrollSwipeTarget = 0

    // new Gesture(window, this.eGesture.bind(this), {
    //   disableDrag: true,
    //   // disableSwipe: true,
    //   onStart: this.eSwipeStart.bind(this),
    //   onUpdate: this.eSwipeUpdate.bind(this),
    // })
  }
  getSize() {
    this.scrollMax = this.el.clientWidth - window.innerWidth
  }
  eGesture({ diff, direction, type }) {
    if (!store.isOpeningEnd) return
    if (type === 'wheel') {
      if (direction === 'Right' || direction === 'Left') {
        window.scrollBy(0, diff.x * 0.6)
      }
    } else if (type === 'swipe') {
      // swipe無効
      if (direction === 'Right' || direction === 'Left') {
        this.scrollYSwipeStart = this.scrollYSmoothOwn
        this.scrollSwipeNow = this.scrollYSmoothOwn
        // if (this.isHorizonalScroll) {
        //   this.isHorizonalScroll = false
        //   console.log(this.isHorizonalScroll)
        // }
      }
    } else if (type === 'keyboard') {
      if (direction === 'Right') {
        window.scrollBy(0, 30)
      } else if (direction === 'Left') {
        window.scrollBy(0, -30)
      }
    }
  }
  eSwipeUpdate({ e, diff, direction, type }) {
    if (!store.isOpeningEnd) return
    if (type === 'swipe') {
      if (direction === 'Right' || direction === 'Left') {
        if (!this.isHorizonalScroll) {
          this.isHorizonalScroll = true
        }

        const target = e.touches[0].target
        if (
          'sliderItem' in target.dataset ||
          target.classList.contains('lStore-article-thumb-inner')
        )
          return
        // 案1
        // window.scrollTo(0, this.scrollYSwipeStart - diff.x * 4.0)

        // 案2

        gsap.to(window, {
          scrollTo: {
            y: this.scrollYSwipeStart - diff.x - diff.y,
          },
          duration: 0.15,
          ease: 'none',
        })

        // 案3
        // this.scrollSwipeTarget = this.scrollYSwipeStart - diff.x * 4.0
        // this.scrollSwipeNow +=
        //   (this.scrollSwipeTarget - this.scrollSwipeNow) * param.lerp
        // window.scrollTo(0, this.scrollSwipeNow)
      } else {
        e.preventDefault()
      }
    }
  }
  eSwipeStart(position, type) {
    if (!store.isOpeningEnd) return
    if (type === 'swipe') {
      this.swipePos = position
      this.scrollYSwipeStart = this.scrollYSmoothOwn
      this.scrollSwipeNow = this.scrollYSmoothOwn
    }
  }

  _setScrollerSize() {
    const sh = window.innerHeight
    const sw = window.innerWidth
    document.body.style.height = this.isHorizontal
      ? this.el.offsetWidth - (sw - sh) + (this.el.clientHeight - sh) + 'px'
      : this.el.offsetHeight + 'px'
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

  scrollTo(target = 0, option = {}) {
    const {
      isFast = false,
      duration = isFast ? 0.0001 : param.duration,
      autoKill = false,
      disableOffset = true,
      disableLerp = isFast,
    } = option
    let { offset = 0 } = option
    offset =
      disableOffset || target === 0
        ? 0
        : offset !== 0
        ? offset
        : this._getOffsetY()

    const onComplete = () => {
      this.setScrollY(this.scrollYSmoothOwn)
      if (option.onComplete) {
        option.onComplete()
      }
    }

    if (target === window.pageYOffset && onComplete) {
      // ターゲットと現在のスクロール位置が同じとき
      onComplete()
      return true
    } else if (isFast) {
      // scrollToFastを実行したとき
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
          target.getBoundingClientRect().left + offset + this.scrollYSmoothOwn
      } else {
        top = target + offset
      }
      this.disableLerp = true
      this.scrollYSmoothDest = this.scrollYSmoothOwn = this.scrollYNativeOwn = store.scrollYNative = this.scrollYPrev = top
      window.scrollTo({
        top,
      })
      onComplete()
      return true
    } else {
      store.isScrollAnimating = true
      gsap.killTweensOf(window, { scrollTo: true })
      return gsap.to(window, {
        scrollTo: {
          y: this.isHorizontal
            ? target === 0
              ? target
              : target.getBoundingClientRect().left + store.scrollY
            : target,
          offsetY: -offset,
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
  }

  scrollToId(id, option) {
    const target = id === 'top' ? 0 : `#${id}`
    return this.scrollTo(target, option)
  }

  scrollToFast(target, option = {}) {
    option.isFast = true
    return this.scrollTo(target, option)
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

  setView(el, view) {
    if (view) {
      this.destroyView(view)
    }

    const name = el.dataset.view || el.className
    const isOnce = 'viewOnce' in el.dataset
    let isEnter = false
    this.listenerIntersect.push({ el, name, param, isOnce })
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting === isEnter) return
          isEnter = entry.isIntersecting
          this.view(name, isEnter)
          if (isOnce && isEnter) {
            observer.unobserve(el)
          }
        })
      },
      {
        root: null,
        rootMargin: el.dataset.viewMargin || '0px',
        threshold: el.dataset.viewThreshold
          ? el.dataset.viewThreshold.split(',').map((s) => Number(s))
          : [0, Math.min(window.innerHeight / el.offsetHeight, 1)],
      }
    )
    observer.observe(el)
    return { observer, el }
  }

  setViewSelf(el, view) {
    if (view) {
      this.destroyView(view)
    }

    const name = el.dataset.view || el.className
    const isOnce = 'viewOnce' in el.dataset
    const param = {
      root: null,
      rootMargin: el.dataset.viewMargin || '0px',
      threshold: el.dataset.viewThreshold
        ? el.dataset.viewThreshold.split(',').map((s) => Number(s))
        : [0, Math.min(window.innerHeight / el.offsetHeight, 1)],
    }
    this.listenerIntersect.push({ el, name, param, isOnce })
  }
  fireViewSelf() {
    const observerArray = []
    this.listenerIntersect.forEach((listener, index) => {
      if (index === 0) {
        const observer = new IntersectionObserver(
          this.getViewSelf.bind(this),
          listener.param
        )
        observer.observe(listener.el)
        observerArray.push(observer)
      } else {
        const { root, rootMargin, threshold } = listener.param
        const length = observerArray.length
        for (let i = 0; i < length; i++) {
          if (
            root === observerArray[i].root &&
            rootMargin === observerArray[i].rootMargin &&
            threshold.every((item, index) => {
              return item === observerArray[i].thresholds[index]
            })
          ) {
            observerArray[i].observe(listener.el)
            break
          }
          if (i === length - 1) {
            const observer = new IntersectionObserver(
              this.getViewSelf.bind(this),
              listener.param
            )
            observer.observe(listener.el)
            observerArray.push(observer)
          }
        }
      }
    })
  }
  getViewSelf(entries, observer) {
    entries.forEach((entry) => {
      const targetListener = this.listenerIntersect.filter(
        (item) => item.el === entry.target
      )
      this.exeViewSelf(entry, targetListener[0], observer)
    })
  }
  exeViewSelf(entry, listener, observer) {
    let isEnter = false
    // if (entry.isIntersecting === isEnter) return
    isEnter = entry.isIntersecting
    this.viewSelf(listener.name, isEnter)
    if (listener.isOnce && isEnter) {
      observer.unobserve(listener.el)
    }
  }

  setViewAll(isPermanent = false) {
    if (isPermanent) {
      this.viewsPermanent = [
        ...this.el.querySelectorAll('[data-permanent] [data-view]'),
      ].map((el, i) =>
        this.setView(el, this.viewsPermanent && this.viewsPermanent[i])
      )
    } else {
      this.views = [
        ...this.el.querySelectorAll('[data-router-view] [data-view]'),
      ].map((el, i) => this.setView(el, this.views && this.views[i]))
    }
  }

  destroyView(obj = {}) {
    const { observer, el } = obj
    observer.unobserve(el)
  }

  destroyViewAll() {
    if (!this.views) return
    this.views.forEach((view) => {
      this.destroyView(view)
    })
    this.views = null
  }

  addView(callback, el = null) {
    if (this.isDisable) return
    let name
    if (el) {
      name = el.dataset.view || el.className
    }

    this._callbackListView.push({ name, callback })
  }

  removeView(callback) {
    if (this.isDisable) return

    this._callbackListView.some((value, i) => {
      if (value.callback === callback) {
        this._callbackListView.splice(i, 1)
        return true
      }
      return false
    })
  }

  viewSelf(value, way) {
    if (store.isOpenModal) return
    const target = this._callbackListView.filter((item) => {
      return item.name === value
    })
    if (target[0]) {
      target[0].callback(value, way)
    }
  }

  view(value, way) {
    if (store.isOpenModal) return
    for (let i = 0; i < this._callbackListView.length; i++) {
      this._callbackListView[i].callback(value, way)
    }
  }

  start() {
    if (this.isDisable) return

    this.playTick()
    allowScroll()
  }

  stop() {
    if (this.isDisable) return

    this.pauseTick()
    preventScroll()
  }

  _updateIsSmooth() {
    this.isSmooth = this.isSp ? param.smoothSp : param.smooth

    if (this.isSmooth) {
      this.el.style.position = 'fixed'
      this.el.style.willChange = 'transform'
      this.el.setAttribute('data-fixed', '')
      document.documentElement.classList.remove('sDisableSmoothScroll')
    } else {
      this.el.style.position = ''
      this.el.style.willChange = ''
      this.el.removeAttribute('data-fixed')
      document.documentElement.classList.add('sDisableSmoothScroll')
    }
  }

  onTick() {
    if (store.isOpenModal) return

    if (this.isSmooth) {
      this.scrollYPrev = this.scrollYSmoothOwn
      this.scrollYSmoothOwn +=
        (this.scrollYNativeOwn - this.scrollYSmoothOwn) * param.lerp
      // this.scrollYSmoothOwn = Math.floor(this.scrollYSmoothOwn * 100) / 100
      if (Math.abs(this.scrollYNativeOwn - this.scrollYSmoothOwn) < 0.1) {
        this.scrollYSmoothOwn = this.scrollYNativeOwn
      }
      this.scrollYSmoothOwn = Math.max(
        Math.min(this.scrollYSmoothOwn, this.scrollMax),
        0
      )

      if (this.disableLerp) {
        this.pauseTick()

        this.el.style.transform = this.isHorizontal
          ? `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,${-this.scrollYSmoothDest},0,0,1)`
          : `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,${-this.scrollYSmoothDest},0,1)`

        this.setScrollY(this.scrollYSmoothDest)

        this.disableLerp = false
      } else {
        gsapK.to(this, {
          scrollYSmoothDest: this.scrollYSmoothOwn,
          duration: 0.15,
          ease: 'none',
          onUpdate: () => {
            this.diffScrollY = this.scrollYSmoothDest - this.scrollYPrev
            this.diffScrollY =
              this.diffScrollY < 0
                ? Math.max(this.diffScrollY, -DIFF_SCROLL_Y_MAX)
                : Math.min(this.diffScrollY, DIFF_SCROLL_Y_MAX)

            this.diffScrollYSmooth +=
              (this.diffScrollY - this.diffScrollYSmooth) * param.lerpDiff
            if (Math.abs(this.diffScrollY - this.diffScrollYSmooth) < 0.1) {
              this.diffScrollYSmooth = this.diffScrollY
            }

            if (
              // this.scrollYSmoothDest === this.scrollYNativeOwn &&
              // this.diffScrollYSmooth === 0
              this.diffScrollYSmooth < 0.01 &&
              this.diffScrollYSmooth > -0.01
            ) {
              this.pauseTick()
            }

            this.el.style.transform = this.isHorizontal
              ? `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,${-this
                  .scrollYSmoothDest},0,0,1)`
              : `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,${-this
                  .scrollYSmoothDest},0,1)`

            this.setScrollY(this.scrollYSmoothDest)
          },
        })
      }
    } else {
      this.diffScrollYSmooth +=
        (this.diffScrollY - this.diffScrollYSmooth) * param.lerpDiff
      if (Math.abs(this.diffScrollY - this.diffScrollYSmooth) < 0.1) {
        this.diffScrollYSmooth = this.diffScrollY
      }

      if (!this.isSmooth && this.diffScrollYSmooth === 0) {
        this.pauseTick()
      }

      this.setScrollY(this.scrollYSmoothDest)
    }
  }

  setScrollY(y, isForce) {
    store.scrollYSmooth = store.scrollY = y

    for (let i = 0; i < this.listenersAnimateScroll.length; i = (i + 1) | 0) {
      this.listenersAnimateScroll[i](y, this.diffScrollYSmooth, isForce)
    }

    // パララックス
    for (let i = 0; i < this.dataParallax.length; i = (i + 1) | 0) {
      const { el, start, end, speed } = this.dataParallax[i]
      // console.log(el, start, end, speed)
      if (y < start || end < y) {
        if (this.dataParallax[i].willChange) {
          el.style.willChange = ''
          this.dataParallax[i].willChange = false
        }
        continue
      }

      if (!this.dataParallax[i].willChange) {
        el.style.willChange = 'transform'
        this.dataParallax[i].willChange = true
      }

      const progress = map(y, start, end, -1, 1)
      const position = -(progress * speed)
      // const position = -progress

      // el.style.transform = this.isHorizontal
      //   ? `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,${position},0,0,1)`
      //   : `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,${position},0,1)`
      if (this.isHorizontal) {
        gsap.to(el, { x: position, duration: 0.15, ease: 'none' })
      } else {
        gsap.to(el, { y: position, duration: 0.15, ease: 'none' })
      }
    }

    if (process.env.idPerfectPixel && this.isSmooth && this.isHorizontal) {
      const elPerfectPixel = document.getElementById(process.env.idPerfectPixel)
      if (elPerfectPixel) {
        elPerfectPixel.style.position = `fixed`
        elPerfectPixel.style.transform = `translate3d(${-y}px,0,0)`
      }
    }
  }

  onScrollNative(y) {
    if (this.isSmooth || store.isOpenModal) return

    this.playTick()
    this.scrollYPrev = this.scrollYSmoothOwn
    this.scrollYSmoothOwn = store.scrollYNative = y

    this.diffScrollY = this.scrollYSmoothOwn - this.scrollYPrev
    this.diffScrollY =
      this.diffScrollY < 0
        ? Math.max(this.diffScrollY, -DIFF_SCROLL_Y_MAX)
        : Math.min(this.diffScrollY, DIFF_SCROLL_Y_MAX)
    // this.setScrollY(y)

    this.decreaseDiffScrollY()
  }

  decreaseDiffScrollY() {
    if (this.timerScrollNative) {
      cancelAnimationFrame(this.timerScrollNative)
    }
    if (this.diffScrollY !== 0) {
      this.timerScrollNative = requestAnimationFrame(() => {
        this.diffScrollY =
          this.diffScrollY < 0
            ? Math.min(this.diffScrollY + 1, 0)
            : Math.max(this.diffScrollY - 1, 0)
        this.timerScrollNative = null
        this.decreaseDiffScrollY()
      })
    } else {
      this.scrollYPrev = this.scrollYSmoothOwn
    }
  }

  onScrollThrottle(y) {
    if (!this.isSmooth || store.isOpenModal) return

    this.playTick()
    this.scrollYNativeOwn = store.scrollYNative = y
  }

  onResize(isForce) {
    if (this.isDisable || store.isOpenModal) return
    this.getSize()
    this._updateIsSmooth()
    this.update()
  }

  update() {
    this._setScrollerSize()
    this._updateParallax()
    requestAnimationFrame(() => {
      this.scrollYSmoothDest = this.scrollYSmoothOwn = this.scrollYNativeOwn = store.scrollYNative = this.scrollYPrev =
        window.scrollY
      this.setScrollY(this.scrollYSmoothOwn, true)
    })
  }

  _updateParallax() {
    const elTransitionContents = getComputedTransform(
      store.elTransitionContents
    )

    const yElTransitionContents = elTransitionContents.y
    const xElTransitionContents = elTransitionContents.y

    // パララックス
    this.dataParallax = Array.prototype.map.call(
      this.el.querySelectorAll('[data-parallax]'),
      (el, i) => {
        el.style.transform = ''
        const rect = el.getBoundingClientRect()
        const speed = getVariableSize(
          Number(
            this.isSp && 'parallaxSp' in el.dataset
              ? el.dataset.parallaxSp
              : el.dataset.parallax
          )
        )
        const start = this.isHorizontal
          ? rect.left +
            window.scrollY -
            xElTransitionContents -
            window.innerWidth -
            Math.abs(speed * 2)
          : rect.top +
            window.scrollY -
            yElTransitionContents -
            window.innerHeight -
            Math.abs(speed * 2)
        const end = this.isHorizontal
          ? rect.right +
            window.scrollY -
            xElTransitionContents +
            Math.abs(speed * 2)
          : rect.bottom +
            window.scrollY -
            yElTransitionContents +
            Math.abs(speed * 2)

        return {
          el,
          start,
          end,
          speed,
        }
      }
    )

    // インナーパララックス
    this.dataParallax = this.dataParallax.concat(
      Array.prototype.map.call(
        this.el.querySelectorAll('[data-parallax-inner]'),
        (el, i) => {
          el.style.transform = ''
          let elParent = el.parentElement
          if (elParent.tagName === 'PICTURE') {
            elParent = elParent.parentElement
          }
          const rect = el.getBoundingClientRect()
          const rectParent = elParent.getBoundingClientRect()
          return {
            el,
            start:
              rectParent.top +
              window.scrollY -
              yElTransitionContents -
              window.innerHeight,
            end: rectParent.bottom + window.scrollY - yElTransitionContents,
            speed: rectParent.height - rect.height,
          }
        }
      )
    )
  }

  _getOffsetY() {
    let elFixed = document.querySelector(
      `[data-anchor-offset="${media.isSp ? 'sp' : 'pc'}"]`
    )
    if (!elFixed) {
      elFixed = document.querySelector(`[data-anchor-offset]`)
    }
    return elFixed ? -elFixed.getBoundingClientRect().bottom : 0
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
    this.destroyViewAll()
  }

  onEnterReady() {
    requestAnimationFrame(() => {
      this.setViewAll()
    })
  }

  onDestroy() {
    this.destroyViewAll()
    this._callbackScroll = null
    this.listenersAnimateScroll = []
    this.listenersResizeSelf = []
    this.listenerIntersect = []
    this._callbackListView = []
    this.dataParallax = []

    super.onDestroy()
  }
}
