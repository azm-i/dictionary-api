import gsapK from '~/utils/gsapK'
import Component from '~/parentClass/Component'
import passive from '~/utils/passive'
import { isIE } from '~/utils/navigator'
import { getClientPos } from '~/utils/event'
import media from '~/utils/media'
import {
  addMouseenterListener,
  addMouseleaveListener,
  removeMouseenterListener,
  removeMouseleaveListener,
} from '~/utils/mouse'
import { getLoopedNumber } from '~/utils/math'

//
// パラメーター
//

const param = {
  ease: 0.5,
}

//
// 定数
//

const CLASS_NAME_DISABLE_SLIDE = '-disable'
const CLASS_NAME_DISABLE_BUTTON = '-disable'

//
// main
//

export default class CSlider extends Component {
  static selectorRoot = '[data-slider]:not([data-slider-manual])'
  _isInit = false
  _isDisable = false
  item = null
  _isMouseDown = false
  _isMouseMove = false
  _isMouseMoveVertical = false
  _isProgressDrag = false
  _pos = null
  _posOffset = null
  _startPos = null
  _listSize = null
  _totalSize = 0
  _listOffsetLeft = 0 // ウィンドウ左端からのスライド left 位置
  _follow = 0
  _isMoving = false
  _isMoveUseBtn = false
  _moveTotal = 0
  nowKey = 0
  _nowKeyCurrent = -1
  _nowKeyNext = -1
  _nowKeyPrev = -1
  _nowKeyCurrent2 = -1
  _nowKeyNext2 = -1
  _nowKeyPrev2 = -1
  _nowKeyCurrent3 = -1
  _nowKeyNext3 = -1
  _nowKeyPrev3 = -1
  _eMouseOverHandler = undefined
  _eMouseOutHandler = undefined
  _eMouseDownHandler = undefined
  _eMouseMoveHandler = undefined
  _eMouseUpHandler = undefined
  _eWindowMouseUpHandler = undefined
  _eClickNextBtnHandler = undefined
  _eClickPrevBtnHandler = undefined
  _eClickNextSlideHandler = undefined
  _eClickPrevSlideHandler = undefined
  _moveTween = undefined
  _lastPos = undefined
  onClickItem = undefined
  indexCurrent = 0
  xNext = 0
  xPrev = 0

  mouse = null
  mouseOld = null
  mouseStart = null
  mouseDiff = null
  mouseDist = null

  // progress
  progress = {
    value: 0,
    start: 0,
    total: 0,
    offset: 0,
  }

  constructor(option = {}) {
    super(option)

    const { el } = this
    if (
      (!media.isSp && el.dataset.slider === 'sp') ||
      (media.isSp && el.dataset.slider === 'pc')
    ) {
      el.classList.add('-disable')
      this._isDisable = true
    }

    this.option = option
    this.framerate = 60 / (option.fps || 60)

    this._isManual = 'sliderManual' in el.dataset

    if (!this._isManual) {
      this.init()
    }
  }

  init() {
    if (this._isDisable || this._isInit) return
    this._isInit = true

    const el = this.el
    const { option } = this

    this._isLoop =
      'sliderLoop' in el.dataset &&
      !(
        (el.dataset.sliderLoop === 'pc' && media.isSp) ||
        (el.dataset.sliderLoop === 'sp' && !media.isSp)
      )

    this._lastSlide = option.lastSlide || 1
    this._lastSlideSp = option.lastSlideSp || 1

    this.onMove = option.onMove
    if (option.onChange) {
      this.onChange = option.onChange
    }

    this.isManualAddBackground = option.isManualAddBackground

    this.elList = el.querySelector('[data-slider-list]')
    this._parent = el
    this._elCurrent = el.querySelectorAll('[data-slider-current]')
    this._elAll = el.querySelectorAll('[data-slider-all]')
    this._nextBtn = el.querySelector('[data-slider-next]')
    this._prevBtn = el.querySelector('[data-slider-prev]')
    this._progress = el.querySelector('[data-slider-progress]')
    this._progressBar = el.querySelector('[data-slider-progress-bar]')
    this._progressCircle = el.querySelector('[data-slider-progress-circle]')

    this._pos = { x: 0, y: 0 }
    this._posOffset = { x: 0, y: 0 }
    this._startPos = { x: 0, y: 0 }
    this._listSize = { x: 0, y: 0 }
    this._totalSize = 0

    this.mouse = { x: 0, y: 0 }
    this.mouseOld = { x: 0, y: 0 }
    this.mouseStart = { x: 0, y: 0 }
    this.mouseDiff = { x: 0, y: 0 }
    this.mouseDist = { x: 0, y: 0 }

    if (this._progress) {
      this.progress.total = this._progress.getBoundingClientRect.width
      this.progress.offset = this.el.offsetLeft
    }

    if (!media.isSp) {
      this.elList.style.cursor = 'grab'
    }

    this.count = 0

    let elsItem = this.elList.querySelectorAll('[data-slider-item]')

    if (this._isLoop) {
      let fragment = document.createDocumentFragment()
      elsItem.forEach((el) => {
        fragment.append(el.cloneNode(true))

        if (!('sliderItemMore' in el.dataset)) {
          this.count++
        }
      })
      this.elList.prepend(fragment)

      fragment = document.createDocumentFragment()
      elsItem.forEach((el) => {
        fragment.append(el.cloneNode(true))
      })
      this.elList.append(fragment)

      elsItem = this.elList.querySelectorAll('[data-slider-item]')
    }
    this.item = Array.prototype.map.call(elsItem, (el, i) => {
      const item = new CSliderItem(el)

      item.init()
      item.onClick = (e) => {
        if (this._isMoveUseBtn) return

        if (this._isMouseMove) {
          e.preventDefault()
          e.stopPropagation()
          this._isMouseMove = false
          this.enableClick()
        }
      }

      if (!this._isLoop && !('sliderItemMore' in el.dataset)) {
        this.count++
      }

      return item
    })

    this._eMouseOverHandler = this._eMouseOver.bind(this)
    addMouseenterListener(this._parent, this._eMouseOverHandler)

    this._eMouseOutHandler = this._eMouseOut.bind(this)
    addMouseleaveListener(this._parent, this._eMouseOutHandler)

    this._eMouseDownHandler = this._eMouseDown.bind(this)
    this._parent.addEventListener('mousedown', this._eMouseDownHandler, passive)

    this._eDragstartHandler = this._eDragstart.bind(this)
    this._parent.addEventListener('dragstart', this._eDragstartHandler)

    this._eMouseMoveHandler = this._eMouseMove.bind(this)
    this._parent.addEventListener('mousemove', this._eMouseMoveHandler)

    this._eMouseUpHandler = this._eMouseUp.bind(this)
    this._parent.addEventListener('mouseup', this._eMouseUpHandler, passive)

    this._eWindowMouseUpHandler = this._eMouseUp.bind(this)
    window.addEventListener('mouseup', this._eWindowMouseUpHandler, passive)

    this._eMouseDownHandler = this._eMouseDown.bind(this)
    this._parent.addEventListener(
      'touchstart',
      this._eMouseDownHandler,
      passive
    )

    this._eMouseMoveHandler = this._eMouseMove.bind(this)
    this._parent.addEventListener('touchmove', this._eMouseMoveHandler, passive)

    this._eMouseUpHandler = this._eMouseUp.bind(this)
    this._parent.addEventListener('touchend', this._eMouseUpHandler, passive)

    this._eWindowMouseUpHandler = this._eMouseUp.bind(this)
    window.addEventListener('touchend', this._eWindowMouseUpHandler, passive)

    // NEXT,PREVボタン設定
    if (this._nextBtn) {
      this._eClickNextBtnHandler = this._eClickNextBtn.bind(this)
      this._nextBtn.addEventListener('click', this._eClickNextBtnHandler)
    }
    if (this._prevBtn) {
      this._eClickPrevBtnHandler = this._eClickPrevBtn.bind(this)
      this._prevBtn.addEventListener('click', this._eClickPrevBtnHandler)
      this._prevBtn.classList.add(CLASS_NAME_DISABLE_BUTTON)
    }

    // プログレスバーのつまみ
    if (this._progressCircle) {
      this._progressCircle.addEventListener(
        'mousedown',
        this._eMouseDownHandler,
        passive
      )
      this._progressCircle.addEventListener(
        'mouseup',
        this._eMouseUpHandler,
        passive
      )
      this._progressCircle.addEventListener(
        'touchstart',
        this._eMouseDownHandler,
        passive
      )
      this._progressCircle.addEventListener(
        'touchend',
        this._eMouseUpHandler,
        passive
      )
    }

    this._setCurrent()
    this._setAll()

    // 社員詳細では、本人の次の方がスライダーの初期値になるように
    const initialPosition = el.dataset.sliderInitialPosition
    if (initialPosition) {
      const initialIndex = initialPosition - 1
      const lastLength = el.querySelectorAll('[data-slider-item]').length
      this._moveTo(lastLength === initialIndex ? 0 : initialIndex, {
        disableAnimation: true,
      })
    } else if (this._isLoop) {
      this._moveTo(this.count, { disableAnimation: true })
    }

    this.onResize()

    this.widthItem = this.item[0].width
  }

  onResize() {
    if (this._isDisable || !this._isInit) return

    const rectParent = this._parent.getBoundingClientRect()
    this._lastPos = this.item[this.item.length - 1].getPos()
    this._listOffsetLeft = parseInt(
      rectParent.left +
        parseInt(
          document.defaultView.getComputedStyle(this._parent, null).paddingLeft
        )
    )
    this._listSize.x =
      this._lastPos.right + this._pos.x * -1 + this._listOffsetLeft
    this._maxMove =
      Math.floor(rectParent.width / this._lastPos.width) *
      this._lastPos.width *
      0.6

    this.elList.style.transform = ''

    this._totalSize =
      this.item[this.item.length - 1].el.getBoundingClientRect().left -
      this.elList.getBoundingClientRect().left +
      this.elList.scrollLeft

    this.item.forEach((item) => {
      item.onResize()
    })

    if (this._progress) {
      this.progress.total = this._progress.getBoundingClientRect().width
      this.progress.offset = this.el.offsetLeft
    }

    this._initialX = this._pos.x

    this._moveTo(this.nowKey, { disableAnimation: true })
  }

  play() {
    if (this._isPlay) return
    this._isPlay = true
    // this.setWillChange()
    this.playTick()
  }

  pause() {
    if (!this._isPlay) return
    this._isPlay = false
    // this.resetWillChange()
    this.pauseTick()
  }

  /**
   *
   */
  _eClickNextBtn(e) {
    if (e) e.stopPropagation()
    if (this.mouseDiffStartX > 0) return
    this._move(true)
  }

  /**
   *
   */
  _eClickPrevBtn(e) {
    if (e) e.stopPropagation()
    if (this.mouseDiffStartX > 0) return
    this._move(false)
  }

  /**
   *
   */
  _eDragstart(e) {
    // Firefoxでドラッグしたときの不具合回避
    e.preventDefault()
  }

  /**
   *
   */
  _eMouseOver(e) {
    // this.setWillChange()
  }

  /**
   *
   */
  _eMouseOut(e) {
    // this.resetWillChange()
  }

  /**
   *
   */
  _eMouseDown(e) {
    if (this._isMouseDown) return
    if ('sliderProgressCircle' in e.target.dataset) {
      this._isProgressDrag = true

      document.documentElement.classList.add('-grabbing')
      if (this._progressCircle) {
        this._progressCircle.classList.add('-grabbing')
      }
    }

    const { x, y } = getClientPos(e)
    this.mouseStart.x = this.mouse.x = x
    this.mouseStart.y = this.mouse.y = y
    this.mouseDiff.x = 0
    this.mouseDiff.y = 0

    this._isMouseDown = true
    this._moveTotal = 0
    this._startPos.x = this._isProgressDrag ? -this._pos.x : this._pos.x

    if (!media.isSp) {
      this.elList.style.cursor = 'grabbing'
    }
    if (this.onMouseDownHandle) {
      this.onMouseDownHandle()
    }
  }

  /**
   *
   */
  _eMouseMove(e) {
    if (this._isMoving) return
    this.progress.start = e.clientX
    if (this._isMouseDown) {
      this.mouseOld.x = this.mouse.x
      this.mouseOld.y = this.mouse.y

      const { x, y } = getClientPos(e)
      this.mouse.x = x
      this.mouse.y = y

      this.mouseDiff.x = this.mouseOld.x - this.mouse.x
      this.mouseDiff.y = this.mouseOld.y - this.mouse.y

      this.elList.classList.add('-drag')

      if (Math.abs(this.mouseDiff.y) >= Math.abs(this.mouseDiff.x)) {
        // 上下方向
        // スライダーの移動を無効にする
        this._isMouseMoveVertical = true
        return
      } else {
        // 左右方向
        // 上下スクロールを無効にする
        if (e.cancelable) {
          e.preventDefault()
        }
      }
    } else {
      return
    }

    this._isMouseMoveVertical = false
    this._isMouseMove = true
    this.disableClick()
    this._cancelMove()
  }

  /**
   *
   */
  _eMouseUp(e) {
    if (!this._isMouseDown) return

    this._isMouseDown = false

    if (this.onMouseUpHandle) {
      this.onMouseUpHandle()
    }

    this.mouseDiffStartX = Math.abs(this.mouse.x - this.mouseStart.x)
    if (this.mouseDiffStartX > 0) {
      if (!media.isSp || this._isProgressDrag) {
        let nowKey = this._getNowItemKey()
        const lastSlide = this._lastSlide
        if (nowKey >= this.item.length - lastSlide) {
          nowKey = this.item.length - lastSlide
        }
        this._moveTo(nowKey, { isDrag: true })
      } else {
        let nowKey =
          this.mouseDiff.x > 0
            ? this.nowKey + 1
            : this.mouseDiff.x < 0
            ? this.nowKey - 1
            : this.nowKey
        const lastSlide = this._lastSlideSp
        nowKey = Math.min(Math.max(nowKey, 0), this.item.length - lastSlide)
        this._moveTo(nowKey, { isDrag: true })
      }
    }

    this._isProgressDrag = false
    document.documentElement.classList.remove('-grabbing')
    if (this._progressCircle) {
      this._progressCircle.classList.remove('-grabbing')
    }
    this.elList.classList.remove('-drag')
    if (!media.isSp) {
      this.elList.style.cursor = 'grab'
    }
  }

  /**
   *
   */
  setWillChange() {
    this.elList.style.willChange = 'transform'
  }

  /**
   *
   */
  resetWillChange() {
    this.elList.style.willChange = 'auto'
  }

  disableClick() {
    this.item.forEach(({ el }) => {
      el.style.pointerEvents = 'none'
    })
  }

  enableClick() {
    this.item.forEach(({ el }) => {
      el.style.pointerEvents = 'auto'
    })
  }

  onTick(time, count) {
    if (this._isDisable) return
    if (count % this.framerate !== 0) return

    const { ease } = param

    let slideDistance
    if (this._progress) {
      this.progress.value =
        (this.progress.start - this.progress.offset) / this.progress.total
      slideDistance =
        (this._listSize.x - this._listSize.x / this.item.length) *
        this.progress.value
    }

    if (this._isMouseDown && !this._isMouseMoveVertical) {
      this.mouseDist.x = this._isProgressDrag
        ? (this.mouseStart.x - this.mouse.x) * (this.item.length / 2)
        : this.mouseStart.x - this.mouse.x
      this.mouseDist.y = this.mouseStart.y - this.mouse.y

      const dx = this.mouseDist.x
      this._moveTotal += Math.abs(dx)

      // if (media.isSp && Math.abs(this._moveTotal) > 10) {
      //   mouse.isCancelable = true
      // }

      const tgX = this._startPos.x - dx
      if (this._isProgressDrag && this.progress) {
        // this._pos.x -= (tgX + this._pos.x) * ease
        this._pos.x -= (slideDistance + this._pos.x) * ease
      } else {
        this._pos.x += (tgX - this._pos.x) * ease
      }
    } else {
      this._pos.x += this._follow
    }

    if (!this._lastPos) {
      this._lastPos = this.item[this.item.length - 1].getPos()
    }
    const lastSlide = !media.isSp ? this._lastSlide : this._lastSlideSp
    const max = 0
    const min = -this._listSize.x + this._lastPos.width * lastSlide
    if (this._pos.x > max) {
      this._pos.x += (max - this._pos.x) * ease
    }
    if (this._pos.x < min) {
      this._pos.x += (min - this._pos.x) * ease
    }

    if (!this._isMoveUseBtn && this.elList) {
      this.setListPositionX()
    }
    if (this._isProgressDrag) {
      this._setProgress(this.progress.value * 100 + '%')
    } else {
      this._setProgress(this._getProgress())
    }
  }

  setListPositionX(disableAnimation) {
    this.xPrev = this.xNext
    this.xNext = this._pos.x + this._posOffset.x
    this.xReal = this.xNext - this._initialX

    gsap.set(this.elList, {
      x: this.xNext,
    })
    if (this.onMove) {
      this.onMove(this.xReal, disableAnimation ? 0 : this.xNext - this.xPrev)
    }
  }

  /**
   *
   */
  _move(isNext) {
    if (this._isMoveUseBtn) return

    this._isMoveUseBtn = true

    this._cancelMove()

    let nowKey = this._getNowItemKey()
    if (isNext) {
      nowKey++
      const lastSlide = !media.isSp ? this._lastSlide : this._lastSlideSp
      if (nowKey >= this.item.length - lastSlide) {
        nowKey = this.item.length - lastSlide
      }
    } else {
      nowKey--
      if (nowKey < 0) {
        nowKey = 0
      }
    }

    this._moveTo(nowKey)
  }

  /**
   *
   */
  _moveTo(nowKey, option = {}) {
    if (this._isMoving) return
    this._isMoving = true

    const { isDrag, disableAnimation } = option

    this.nowKey = nowKey

    this._setCurrent()
    this._setBtnClass()
    if (this.onChange) {
      this.onChange(nowKey)
    }

    const tgX = this._getXFromItemKey(nowKey)

    this._moveTween = gsapK.to(this._pos, {
      x: tgX,
      duration: disableAnimation ? 0 : isDrag ? 0.6 : 0.8,
      ease: isDrag ? 'power2.out' : 'power2.inOut',
      onUpdate: () => {
        if (!(this.elList && this._pos && this._posOffset)) return
        if (this.changeSlideAnimation && disableAnimation) {
          const tl = gsap.timeline()
          this.changeSlideAnimation({
            tl,
            changeSlide: () => {
              this.setListPositionX(disableAnimation)
            },
          })
        } else {
          this.setListPositionX(disableAnimation)
        }
      },
      onComplete: () => {
        if (!(this.elList && this._pos)) return

        this._pos.x = tgX
        this._isMouseMove = false
        this._isMoving = false
        this._isMoveUseBtn = false
        this.enableClick()

        this._setBtnDisableClass()

        if (this._isLoop) {
          if (nowKey >= this.count * 2) {
            this._moveTo(nowKey - this.count, { disableAnimation: true })
          } else if (nowKey < this.count) {
            this._moveTo(nowKey + this.count, { disableAnimation: true })
          }
        }
      },
    })
  }

  /**
   *
   */
  _cancelMove() {
    if (!this._isMoving) return

    if (this._moveTween) {
      this._moveTween.kill()
    }

    this._isMouseMove = false
    this._isMoveUseBtn = false
    this._isMoving = false
  }

  /**
   *
   */
  _setCurrent() {
    if (!this._isInit) return
    if (
      this._elCurrent.length &&
      !('sliderItemMore' in this.item[this.nowKey].el.dataset)
    ) {
      this.indexCurrent = getLoopedNumber(this.nowKey, this.count)
      this._elCurrent.forEach((item) => {
        item.textContent = this.indexCurrent + 1
      })

      if (this.nowKey >= 0) {
        if (this._nowKeyCurrent >= 0) {
          this.item[this._nowKeyCurrent].el.classList.remove('-current')
          this.item[this._nowKeyNext].el.classList.remove('-next')
          this.item[this._nowKeyPrev].el.classList.remove('-prev')
          if (this._isLoop) {
            this.item[this._nowKeyCurrent2].el.classList.remove('-current')
            this.item[this._nowKeyNext2].el.classList.remove('-next')
            this.item[this._nowKeyPrev2].el.classList.remove('-prev')
            this.item[this._nowKeyCurrent3].el.classList.remove('-current')
            this.item[this._nowKeyNext3].el.classList.remove('-next')
            this.item[this._nowKeyPrev3].el.classList.remove('-prev')
          }
        }

        this._nowKeyCurrent = this.nowKey
        this._nowKeyNext = getLoopedNumber(this.nowKey + 1, this.item.length)
        this._nowKeyPrev = getLoopedNumber(this.nowKey - 1, this.item.length)
        this.item[this._nowKeyCurrent].el.classList.add('-current')
        this.item[this._nowKeyNext].el.classList.add('-next')
        this.item[this._nowKeyPrev].el.classList.add('-prev')
        if (this._isLoop) {
          this._nowKeyCurrent2 = getLoopedNumber(
            this._nowKeyCurrent + this.count,
            this.item.length
          )
          this._nowKeyNext2 = getLoopedNumber(
            this._nowKeyCurrent2 + 1,
            this.item.length
          )
          this._nowKeyPrev2 = getLoopedNumber(
            this._nowKeyCurrent2 - 1,
            this.item.length
          )
          this._nowKeyCurrent3 = getLoopedNumber(
            this._nowKeyCurrent - this.count,
            this.item.length
          )
          this._nowKeyNext3 = getLoopedNumber(
            this._nowKeyCurrent3 + 1,
            this.item.length
          )
          this._nowKeyPrev3 = getLoopedNumber(
            this._nowKeyCurrent3 - 1,
            this.item.length
          )
          this.item[this._nowKeyCurrent2].el.classList.add('-current')
          this.item[this._nowKeyNext2].el.classList.add('-next')
          this.item[this._nowKeyPrev2].el.classList.add('-prev')
          this.item[this._nowKeyCurrent3].el.classList.add('-current')
          this.item[this._nowKeyNext3].el.classList.add('-next')
          this.item[this._nowKeyPrev3].el.classList.add('-prev')
        }
      }
    }
  }

  /**
   *
   */
  _setAll() {
    if (this._elAll.length) {
      this._elAll.forEach((item) => {
        item.textContent = this.count
      })
    }
  }

  /**
   *
   */
  _setBtnDisableClass() {
    if (this._nextSlide) {
      this._nextSlide.classList.remove(CLASS_NAME_DISABLE_SLIDE)
      this._prevSlide.classList.remove(CLASS_NAME_DISABLE_SLIDE)

      const nowKey = this.nowKey
      if (nowKey === 0) {
        this._prevSlide.classList.add(CLASS_NAME_DISABLE_SLIDE)
      }

      const lastSlide = !media.isSp ? this._lastSlide : this._lastSlideSp
      if (nowKey >= this.item.length - lastSlide) {
        this._nextSlide.classList.add(CLASS_NAME_DISABLE_SLIDE)
      }
    }
  }

  /**
   *
   */
  _setBtnClass() {
    if (this._nextBtn) {
      this._nextBtn.classList.remove(CLASS_NAME_DISABLE_BUTTON)
      this._prevBtn.classList.remove(CLASS_NAME_DISABLE_BUTTON)

      const nowKey = this.nowKey
      if (nowKey === 0) {
        this._prevBtn.classList.add(CLASS_NAME_DISABLE_BUTTON)
      }

      const lastSlide = !media.isSp ? this._lastSlide : this._lastSlideSp
      if (nowKey >= this.item.length - lastSlide) {
        this._nextBtn.classList.add(CLASS_NAME_DISABLE_BUTTON)
      }
    }
  }

  /**
   *
   */
  _setProgress(_x) {
    if (!this._progressBar) return

    if (this._isProgressDrag) {
      gsap.set(this._progressBar, {
        width: _x,
      })
      gsap.set(this._progressCircle, {
        left: _x,
      })
    } else {
      gsap.to(this._progressBar, {
        width: _x,
        duration: 0.5,
        ease: 'ease2.out',
      })
      gsap.to(this._progressCircle, {
        left: _x,
        duration: 0.5,
        ease: 'ease2.out',
      })
    }
  }

  /**
   *
   */
  _getNowItemKey() {
    let now = 0
    let d = 9999
    this._listOffsetLeft =
      parseInt(
        this._parent.getBoundingClientRect().left +
          parseInt(
            document.defaultView.getComputedStyle(this._parent, null)
              .paddingLeft
          )
      ) +
      // ここで閾値を調整
      Math.min(Math.max(this.mouseDiff.x * 30, -this._maxMove), this._maxMove)
    const len = this.item.length
    for (let i = 0; i < len; i++) {
      const item = this.item[i]
      const pos = Math.abs(item.getPos().x - this._listOffsetLeft)
      if (pos < d) {
        d = pos
        now = i
      }
    }

    return now
  }

  /**
   *
   */
  _getXFromItemKey(key) {
    if (this.isDestroyed) return

    const { sizeDifference } = this.option
    let elWidth = 0
    let targetWidth = 0
    let distance = 0
    let repeat = 1
    if (sizeDifference) {
      if (key !== 0) {
        elWidth = this.el.clientWidth / 2
        targetWidth = this.item[key].getPos().width / 2
      }
      for (let i = 0; i < key; i++) {
        distance += this.item[i].getPos().width
      }
    } else {
      distance = this.item[0].getPos().width
      repeat = key
    }

    const margin = parseInt(
      document.defaultView.getComputedStyle(this.item[0].el, null).marginRight
    )

    return -(distance + margin * key - elWidth + targetWidth) * repeat
  }

  _getProgress() {
    const _progress =
      Math.abs(parseInt(this._pos.x)) >= parseInt(this._totalSize - 1)
        ? 100
        : parseInt(this._pos.x) > 0
        ? 0
        : parseInt(
            (Math.abs(parseInt(this._pos.x)) / parseInt(this._totalSize)) * 100
          )
    return _progress + '%'
  }

  onCall(value, way, obj) {
    if (this._isDisable) return
    if (!this.el || value !== this.el.dataset.scrollCall || obj.el !== this.el)
      return

    if (way === 'enter') {
      if (!this._isManual) {
        this.init()
      }
      this.play()
    } else {
      this.pause()
    }
  }

  onDestroy() {
    if (this._isDisable) return

    this.pause()

    this.item.forEach((item) => {
      item.dispose()
    })

    removeMouseenterListener(this._parent, this._eMouseOverHandler)
    removeMouseleaveListener(this._parent, this._eMouseOutHandler)
    this._parent.removeEventListener(
      'mousedown',
      this._eMouseDownHandler,
      passive
    )
    this._parent.removeEventListener('dragstart', this._eDragstartHandler)
    this._parent.removeEventListener('mousemove', this._eMouseMoveHandler)
    this._parent.removeEventListener('mouseup', this._eMouseUpHandler, passive)
    window.removeEventListener('mouseup', this._eWindowMouseUpHandler, passive)
    this._parent.removeEventListener(
      'touchstart',
      this._eMouseDownHandler,
      passive
    )
    this._parent.removeEventListener('touchmove', this._eMouseMoveHandler)
    this._parent.removeEventListener('touchend', this._eMouseUpHandler, passive)
    window.removeEventListener('touchend', this._eWindowMouseUpHandler, passive)
    if (this._nextBtn) {
      this._nextBtn.removeEventListener('click', this._eClickNextBtnHandler)
    }
    if (this._prevBtn) {
      this._prevBtn.removeEventListener('click', this._eClickPrevBtnHandler)
    }

    if (this._progressCircle) {
      this._progressCircle.removeEventListener(
        'mousedown',
        this._eMouseDownHandler,
        passive
      )
      this._progressCircle.removeEventListener(
        'mouseup',
        this._eMouseUpHandler,
        passive
      )
      this._progressCircle.removeEventListener(
        'touchstart',
        this._eMouseDownHandler,
        passive
      )
      this._progressCircle.removeEventListener(
        'touchend',
        this._eMouseUpHandler,
        passive
      )
    }

    // reset
    this._isDisable = false
    this.item = null
    this._isMouseDown = false
    this._isMouseMove = false
    this._isMouseMoveVertical = false
    this._isProgressDrag = false
    this._pos = null
    this._posOffset = null
    this._startPos = null
    this._listSize = null
    this._totalSize = 0
    this._listOffsetLeft = 0 // ウィンドウ左端からのスライド left 位置
    this._follow = 0
    this._isMoving = false
    this._isMoveUseBtn = false
    this._moveTotal = 0
    this.nowKey = 0
    this._nowKeyCurrent = -1
    this._nowKeyNext = -1
    this._nowKeyPrev = -1
    this._nowKeyCurrent2 = -1
    this._nowKeyNext2 = -1
    this._nowKeyPrev2 = -1
    this._nowKeyCurrent3 = -1
    this._nowKeyNext3 = -1
    this._nowKeyPrev3 = -1
    this._eMouseOverHandler = undefined
    this._eMouseOutHandler = undefined
    this._eMouseDownHandler = undefined
    this._eMouseMoveHandler = undefined
    this._eMouseUpHandler = undefined
    this._eWindowMouseUpHandler = undefined
    this._eClickNextBtnHandler = undefined
    this._eClickPrevBtnHandler = undefined
    this._eClickNextSlideHandler = undefined
    this._eClickPrevSlideHandler = undefined
    this._moveTween = undefined
    this._lastPos = undefined
    this.onClickItem = undefined
    this.indexCurrent = 0

    this.mouse = null
    this.mouseOld = null
    this.mouseStart = null
    this.mouseDiff = null
    this.mouseDist = null

    super.onDestroy()
  }
}

class CSliderItem {
  constructor(el) {
    this.el = el

    this._eClickHandler = undefined

    this.onClick = undefined
  }

  /**
   *
   */
  init() {
    this._mouseTarget = this.el

    this._eClickHandler = this._eClick.bind(this)
    this.el.addEventListener('click', this._eClickHandler)
  }

  /**
   *
   */
  _eClick(e) {
    if (this.onClick) {
      this.onClick(e)
    }
  }

  /**
   *
   */
  getPos() {
    const computedStyle = document.defaultView.getComputedStyle(this.el, null)
    let width = Number(computedStyle.width.replace('px', ''))
    if (isIE) {
      width += Number(computedStyle.paddingRight.replace('px', ''))
    }

    const rect = this.el.getBoundingClientRect()
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
    const left = rect.left + scrollLeft

    return {
      width,
      x: left,
      right: left + width,
    }
  }

  onResize() {
    this.width = this.el.clientWidth
  }

  /**
   *
   */
  dispose() {
    if (this.el) {
      this._mouseTarget.removeEventListener('click', this._eClickHandler)
      this.el = null
      this._eClickHandler = null
    }

    this.onClick = null
  }
}
