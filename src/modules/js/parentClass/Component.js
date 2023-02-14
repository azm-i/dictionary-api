import {
  onResize,
  offResize,
  onResetSize,
  offResetSize,
  onResizeAlways,
  offResizeAlways,
  onOrientationchange,
  offOrientationchange,
  emitResize,
} from '~/events/window'
import { onTick, offTick } from '~/events/tick'
import {
  offMousedown,
  offMousemove,
  offMouseup,
  onMousedown,
  onMousemove,
  onMouseup,
} from '~/events/mouse'
import {
  addMouseenterListener,
  addMousemoveListener,
  addMouseleaveListener,
  removeMouseenterListener,
  removeMousemoveListener,
  removeMouseleaveListener,
} from '~/utils/mouse'
import {
  onLoadProgress,
  offLoadProgress,
  onLoadDone,
  offLoadDone,
} from '~/events/load'
import { offScroll, onScroll } from '~/events/scroll'
import media from '~/utils/media'
import store from '~/managers/store'
import eventBus from '~/events/eventBus'
import passive from '~/utils/passive'
import { getUniqueId } from '~/utils/string'

export default class Component {
  refs = {}
  isPlayTick = false
  isDestroyed = false
  listeners = {}

  /**
   * Creates an instance of Component.
   * @param {Object} [option={}]
   * @param {Element} [option.el] コンポーネントのルート要素
   * @param {Element} [option.context=document] querySelectorの対象要素
   * @param {boolean} [option.isManualOnMount=false] onMountを自動実行するか
   * @param {boolean} [option.isAutoPlayTick=false] tickを自動実行するか
   * @param {boolean} [option.isPermanent=false] 非同期遷移しても存在し続ける要素かどうか
   * @memberof Component
   */
  constructor(option = {}) {
    const { componentName } = this.constructor
    let { selectorRoot } = this.constructor

    const {
      el,
      context = document,
      isManualOnMount = this.constructor.isManualOnMount || false,
      isAutoPlayTick = this.constructor.isAutoPlayTick || false,
      isPermanent = this.constructor.isPermanent || false,
    } = option
    this.option = option

    if (!el) {
      if (!selectorRoot && componentName) {
        selectorRoot = `[data-el].${componentName}, [data-el="${componentName}"]`
      }
      this.el = context.querySelector(selectorRoot)
    } else {
      this.el = el
    }

    if (componentName) {
      const prefix = `${componentName}-`
      this.el
        .querySelectorAll(
          `[data-ref][class*="${prefix}"], [data-ref^="${prefix}"]`
        )
        .forEach((elRef) => {
          const key = (
            elRef.dataset.ref ||
            String(elRef.classList)
              .split(' ')
              .filter((key) => key.indexOf(prefix) === 0)[0]
          ).replace(prefix, '')
          const variableRef = this.refs[key]
          if (!variableRef) {
            this.refs[key] = elRef
          } else if (Array.isArray(variableRef)) {
            variableRef.push(elRef)
          } else if (variableRef) {
            this.refs[key] = [variableRef, elRef]
          }
        })
    }

    if (this.onMount) {
      this.onMount()
    }

    if (this.onResizeFirst) {
      this.onResizeFirst = this.onResizeFirst.bind(this)
      eventBus.on('resizeFirst', this.onResizeFirst)
    }
    if (this.onResetSize) {
      this.onResetSize = this.onResetSize.bind(this)
      onResetSize(this.onResetSize, true)
    }
    if (this.onResize) {
      this.onResize = this.onResize.bind(this)
      onResize(this.onResize, true)
    }
    if (this.onResizeAlways) {
      this.onResizeAlways = this.onResizeAlways.bind(this)
      onResizeAlways(this.onResizeAlways, true)
    }

    if (this.onOrientationchange) {
      this.onOrientationchange = this.onOrientationchange.bind(this)
      onOrientationchange(this.onOrientationchange, true)
    }

    if (this.onTick) {
      this.onTick = this.onTick.bind(this)

      if (isAutoPlayTick) {
        requestAnimationFrame(() => {
          this.playTick()
        })
      }
    }

    if (this.el) {
      if (this.onClick) {
        this.onClick = this.onClick.bind(this)
        this.el.addEventListener('click', this.onClick)
      }

      if (this.onMouseenter) {
        this.onMouseenter = addMouseenterListener(
          this.el,
          this.onMouseenter.bind(this)
        )
      }
      if (this.onMousemove) {
        this.onMousemove = addMousemoveListener(
          this.el,
          this.onMousemove.bind(this)
        )
      }
      if (this.onMouseleave) {
        this.onMouseleave = addMouseleaveListener(
          this.el,
          this.onMouseleave.bind(this)
        )
      }
    }

    if (this.onMousedownDocument) {
      this.onMousedownDocument = this.onMousedownDocument.bind(this)
      onMousedown(this.onMousedownDocument)
    }
    if (this.onMousemoveDocument) {
      this.onMousemoveDocument = this.onMousemoveDocument.bind(this)
      onMousemove(this.onMousemoveDocument)
    }
    if (this.onMouseupDocument) {
      this.onMouseupDocument = this.onMouseupDocument.bind(this)
      onMouseup(this.onMouseupDocument)
    }

    if (this.onOpenModal) {
      this.onOpenModal = this.onOpenModal.bind(this)
      eventBus.on('openModal', this.onOpenModal)
    }
    if (this.onStartOpenModal) {
      this.onStartOpenModal = this.onStartOpenModal.bind(this)
      eventBus.on('startOpenModal', this.onStartOpenModal)
    }
    if (this.onCompleteOpenModal) {
      this.onCompleteOpenModal = this.onCompleteOpenModal.bind(this)
      eventBus.on('completeOpenModal', this.onCompleteOpenModal)
    }
    if (this.onCloseModal) {
      this.onCloseModal = this.onCloseModal.bind(this)
      eventBus.on('closeModal', this.onCloseModal)
    }
    if (this.onStartCloseModal) {
      this.onStartCloseModal = this.onStartCloseModal.bind(this)
      eventBus.on('startCloseModal', this.onStartCloseModal)
    }
    if (this.onCompleteCloseModal) {
      this.onCompleteCloseModal = this.onCompleteCloseModal.bind(this)
      eventBus.on('completeCloseModal', this.onCompleteCloseModal)
    }

    if (process.env.enableEventAsynchronousTransition) {
      if (this.onLeave) {
        this.onLeave = this.onLeave.bind(this)
        eventBus.on('leave', this.onLeave)
      }
      if (this.onLeaveCompleted) {
        this.onLeaveCompleted = this.onLeaveCompleted.bind(this)
        eventBus.on('leaveCompleted', this.onLeaveCompleted)
      }
      if (this.onEnter) {
        this.onEnter = this.onEnter.bind(this)
        eventBus.on('enter', this.onEnter)
      }
      if (this.onEnterReady) {
        this.onEnterReady = this.onEnterReady.bind(this)
        eventBus.on('enterReady', this.onEnterReady)
      }
      if (this.onEnterShow) {
        this.onEnterShow = this.onEnterShow.bind(this)
        eventBus.on('enterShow', this.onEnterShow)
      }
      if (this.onEnterCompleted) {
        this.onEnterCompleted = this.onEnterCompleted.bind(this)
        eventBus.on('enterCompleted', this.onEnterCompleted)
      }
      if (this.onLeaveCancelled) {
        this.onLeaveCancelled = this.onLeaveCancelled.bind(this)
        eventBus.on('leaveCancelled', this.onLeaveCancelled)
      }
      if (this.onEnterCancelled) {
        this.onEnterCancelled = this.onEnterCancelled.bind(this)
        eventBus.on('enterCancelled', this.onEnterCancelled)
      }
    }

    if (process.env.enableEventPace) {
      if (this.onLoadProgress) {
        this.onLoadProgress = this.onLoadProgress.bind(this)
        onLoadProgress(this.onLoadProgress)
      }
    }
    if (this.onLoadDone) {
      this.onLoadDone = this.onLoadDone.bind(this)
      onLoadDone(this.onLoadDone)
    }

    if (store.cScroll) {
      this.initScroll()
    } else {
      eventBus.once('initPageJs', () => {
        this.initScroll()
      })
    }

    if (!isPermanent && this.onDestroy) {
      eventBus.once('destroy', () => {
        this.onDestroy()
      })
    }

    if (!isManualOnMount && this.onInit) {
      this.onInit()
    }
  }

  initScroll() {
    if (this.onScrollNative) {
      this._onScrollNative = () => {
        this.onScrollNative(window.scrollY)
      }
      window.addEventListener('scroll', this._onScrollNative, passive)
    }
    if (this.onScrollThrottle) {
      this.onScrollThrottle = this.onScrollThrottle.bind(this)
      onScroll(this.onScrollThrottle)
    }
    if (this.onScroll) {
      this.onScroll = this.onScroll.bind(this)
      store.cScroll.onAnimateScroll(this.onScroll)
    }

    if (this.onResizeScroll) {
      this.onResizeScroll = this.onResizeScroll.bind(this)
      store.cScroll.onResizeSelf(this.onResizeScroll)
    }

    if (this.onView) {
      this._onView = (...args) => {
        if (this.isDestroyed || store.isOpenModal) return
        this.onView(...args)
      }
      store.cScroll.addView(this._onView)
    }
    if (this.onViewSelf) {
      if (!('view' in this.el.dataset)) {
        this.el.dataset.view = getUniqueId('onViewSelf-')
      }
      const nameView = this.el.dataset.view
      this._onViewSelf = (name, isEnter) => {
        if (this.isDestroyed || store.isOpenModal || name !== nameView) return
        this.isEnter = isEnter
        this.onViewSelf(isEnter)
      }
      // store.cScroll.setView(this.el)
      store.cScroll.setViewSelf(this.el)
      store.cScroll.addView(this._onViewSelf, this.el)
    }
    if (this.onViewSelfOnce) {
      if (!('view' in this.el.dataset)) {
        this.el.dataset.view = getUniqueId('onViewSelf-')
      }
      if (!('viewThreshold' in this.el.dataset)) {
        this.el.dataset.viewThreshold =
          this.el.offsetHeight > window.innerHeight * 0.4
            ? 0.4
            : Math.min(window.innerHeight / this.el.offsetHeight, 1)
      }
      const nameView = this.el.dataset.view
      this._onViewSelfOnce = (name, isEnter) => {
        if (
          this.isDestroyed ||
          store.isOpenModal ||
          name !== nameView ||
          !isEnter
        )
          return
        this.isEnter = isEnter
        this.onViewSelfOnce()
        store.cScroll.removeView(this._onViewSelfOnce)
      }
      // store.cScroll.setView(this.el)
      store.cScroll.setViewSelf(this.el)
      store.cScroll.addView(this._onViewSelfOnce, this.el)
    }
  }

  get isPc() {
    return !media.isSp
  }

  get isSp() {
    return media.isSp
  }

  get isTb() {
    return media.isTb
  }

  get isTbPortrait() {
    return media.isTbPortrait
  }

  get scrollY() {
    return store.scrollY
  }

  get scrollYSmooth() {
    return store.scrollYSmooth
  }

  get scrollYNative() {
    return store.scrollYNative
  }

  emit(...args) {
    eventBus.emit(...args)
  }

  on(name, listener) {
    this.listeners[name] = listener
    eventBus.on(name, listener)
  }

  once(name, listener) {
    this.listeners[name] = listener
    eventBus.once(name, listener)
  }
  off(name, listener) {
    eventBus.off(name, listener)
  }

  emitResize() {
    this.onResetSize(true)
    this.onResize(true)
    this.onResizeAlways(true)
  }

  emitResizeAll() {
    emitResize(true)
  }

  playTick() {
    if (this.isPlayTick || this.isDestroyed) return
    this.isPlayTick = true
    onTick(this.onTick)
  }

  pauseTick() {
    if (!this.isPlayTick) return
    this.isPlayTick = false
    offTick(this.onTick)
  }

  scrollTo(...args) {
    store.cScroll.scrollTo(...args)
  }

  updateSmoothScroll() {
    store.cScroll.update()
  }

  get isSmoothScroll() {
    return store.cScroll.isSmooth
  }

  onDestroy() {
    this.isDestroyed = true

    if (this.onResizeFirst) {
      eventBus.off('resizeFirst', this.onResizeFirst)
      this.onResizeFirst = null
    }
    if (this.onResetSize) {
      offResetSize(this.onResetSize)
      this.onResetSize = null
    }
    if (this.onResize) {
      offResize(this.onResize)
      this.onResize = null
    }
    if (this.onResizeAlways) {
      offResizeAlways(this.onResizeAlways)
      this.onResizeAlways = null
    }

    if (this.onOrientationchange) {
      offOrientationchange(this.onOrientationchange)
      this.onOrientationchange = null
    }

    if (this.onTick) {
      this.pauseTick()
      this.onTick = null
    }

    if (this.el) {
      if (this.onClick) {
        this.el.removeEventListener('click', this.onClick)
      }

      if (this.onMouseenter) {
        removeMouseenterListener(this.el, this.onMouseenter)
        this.onMouseenter = null
      }
      if (this.onMousemove) {
        removeMousemoveListener(this.el, this.onMousemove)
        this.onMousemove = null
      }
      if (this.onMouseleave) {
        removeMouseleaveListener(this.el, this.onMouseleave)
        this.onMouseleave = null
      }
    }

    if (this.onMousedownDocument) {
      offMousedown(this.onMousedownDocument)
      this.onMousedownDocument = null
    }
    if (this.onMousemoveDocument) {
      offMousemove(this.onMousemoveDocument)
      this.onMousemoveDocument = null
    }
    if (this.onMouseupDocument) {
      offMouseup(this.onMouseupDocument)
      this.onMouseupDocument = null
    }

    if (this.onOpenModal) {
      eventBus.off('openModal', this.onOpenModal)
      this.onOpenModal = null
    }
    if (this.onStartOpenModal) {
      eventBus.off('startOpenModal', this.onStartOpenModal)
      this.onStartOpenModal = null
    }
    if (this.onCompleteOpenModal) {
      eventBus.off('completeOpenModal', this.onCompleteOpenModal)
      this.onCompleteOpenModal = null
    }
    if (this.onCloseModal) {
      eventBus.off('closeModal', this.onCloseModal)
      this.onCloseModal = null
    }
    if (this.onStartCloseModal) {
      eventBus.off('startCloseModal', this.onStartCloseModal)
      this.onStartCloseModal = null
    }
    if (this.onCompleteCloseModal) {
      eventBus.off('completeCloseModal', this.onCompleteCloseModal)
      this.onCompleteCloseModal = null
    }

    if (process.env.enableEventAsynchronousTransition) {
      if (this.onLeave) {
        eventBus.off('leave', this.onLeave)
        this.onLeave = null
      }
      if (this.onLeaveCompleted) {
        eventBus.off('leaveCompleted', this.onLeaveCompleted)
        this.onLeaveCompleted = null
      }
      if (this.onEnter) {
        eventBus.off('enter', this.onEnter)
        this.onEnter = null
      }
      if (this.onEnterReady) {
        eventBus.off('enterReady', this.onEnterReady)
        this.onEnterReady = null
      }
      if (this.onEnterShow) {
        eventBus.off('enterShow', this.onEnterShow)
        this.onEnterShow = null
      }
      if (this.onEnterCompleted) {
        eventBus.off('enterCompleted', this.onEnterCompleted)
        this.onEnterCompleted = null
      }
      if (this.onLeaveCancelled) {
        eventBus.off('leaveCancelled', this.onLeaveCancelled)
        this.onLeaveCancelled = null
      }
      if (this.onEnterCancelled) {
        eventBus.off('enterCancelled', this.onEnterCancelled)
        this.onEnterCancelled = null
      }
    }

    if (process.env.enableEventPace) {
      if (this.onLoadProgress) {
        offLoadProgress(this.onLoadProgress)
        this.onLoadProgress = null
      }
      if (this.onLoadDone) {
        offLoadDone(this.onLoadDone)
        this.onLoadDone = null
      }
    }

    if (this._onScrollNative) {
      window.removeEventListener('scroll', this._onScrollNative, passive)
      this._onScrollNative = null
    }
    if (this.onScrollThrottle) {
      offScroll(this.onScrollThrottle)
      this.onScrollThrottle = null
    }
    if (this.onScroll) {
      store.cScroll.offAnimateScroll(this.onScroll)
      this.onScroll = null
    }

    if (this.onResizeScroll) {
      store.cScroll.offResizeSelf(this.onResizeScroll)
      this.onResizeScroll = null
    }

    if (this._onView) {
      store.cScroll.removeView(this._onView)
      this._onView = null
    }
    if (this._onViewSelf) {
      store.cScroll.removeView(this._onViewSelf)
      this._onViewSelf = null
    }
    if (this._onViewSelfOnce) {
      store.cScroll.removeView(this._onViewSelfOnce)
      this._onViewSelfOnce = null
    }

    Object.keys(this.listeners).forEach((name) => {
      eventBus.off(name, this.listeners[name])
    })

    this.el = null
  }

  static createAll(context = document, option = {}) {
    if (!this.selectorRoot && this.componentName) {
      this.selectorRoot = `[data-el].${this.componentName}, [data-el="${this.componentName}"]`
    }
    const { selector = this.selectorRoot } = option

    return Array.prototype.map.call(
      context.querySelectorAll(selector),
      (el, i) => new this({ el, i, ...option })
    )
  }
}
