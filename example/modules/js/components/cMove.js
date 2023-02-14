import Component from '~/parentClass/Component'
import store from '~/managers/store'
import { getUniqueId } from '~/utils/string'

//
// パラメーター
//

const param = {
  speed: 60,
  speedSp: 30,
}

//
// main
//

export default class CMove extends Component {
  static selectorRoot = '[data-move]:not([data-move-manual])'

  onInit() {
    const {
      el,
      isManual = false,
      isVertical = false,
      isDuplicate = true,
      isInModal = false,
      widthSingle,
      sizeParent = isVertical ? window.innerHeight : el.offsetWidth,
    } = this.option

    this._isInModal = isInModal
    this.elWrapper = el.querySelector('[data-move-wrapper]')
    const elInner = (this.elInner = el.querySelector('[data-move-inner]'))
    const elSingle = el.querySelector('[data-move-single]')
    this.speed = el.dataset.moveSpeed
      ? Number(el.dataset.moveSpeed)
      : param[this.isSp ? 'speedSp' : 'speed']
    const isStop = el.dataset.moveStop ? el.dataset.moveStop === 'true' : true
    const isStopSp = el.dataset.moveStopSp
      ? el.dataset.moveStopSp === 'true'
      : true
    this._widthSingle = widthSingle || elSingle.offsetWidth

    if (isDuplicate) {
      const text = elInner.innerHTML
      elInner.innerHTML =
        this._widthSingle > sizeParent
          ? `${text}${text}${text}`
          : `${text}${text}${text}${text}`
    }

    if (!isManual) {
      if (!('view' in this.el.dataset)) {
        this.el.dataset.view = getUniqueId('cMove-')
      }
      const nameView = this.el.dataset.view
      this._callbackCall = (name, isEnter) => {
        if (this.isDestroyed) return
        if (name !== nameView) return
        if (isEnter) {
          this.play()
        } else {
          if ((!this.isSp && isStop) || (this.isSp && isStopSp)) {
            this.pause()
          }
        }
      }
      store.cScroll.addView(this._callbackCall)
    }
  }

  play() {
    if (this._isPlay) return
    this._isPlay = true
    this.elWrapper.style.willChange = 'transform'
    this.playTick()
  }

  pause() {
    if (!this._isPlay) return
    this._isPlay = false
    this.pauseTick()
    this.elWrapper.style.willChange = 'auto'
  }

  onTick(time) {
    this.elWrapper.style.transform = `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,-${(time *
      this.speed) %
      this._widthSingle},0,0,1)`
  }

  onStartOpenModal() {
    if (this._isInModal) return

    this._isPlayPrev = this._isPlay
    if (this._isPlayPrev) {
      this.pause()
    }
  }

  onStartCloseModal() {
    if (this._isInModal) return

    if (this._isPlayPrev) {
      this.play()
      this._isPlayPrev = false
    }
  }

  onDestroy() {
    this.pause()
    if (this._callbackCall) {
      store.cScroll.removeView(this._callbackCall)
      this._callbackCall = null
    }

    this._listener = null

    super.onDestroy()
  }
}
