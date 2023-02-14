import { gsap } from 'gsap'
import gsapK from '~/utils/gsapK'
import Component from '~/parentClass/Component'

//
// パラメーター
//

const param = {
  lerp: 0.1,
  lerpLeave: 0.15,
  durationBorder: 0.7,
  easeBorder: 'medium',
  rateLeft: 1,
  rateTop: 1,
  rateStickyInner: 0.5,
}

//
// main
//

export default class CButton extends Component {
  static selectorRoot = '[data-button]'
  _isHover = false
  _mouseLeft = 0
  _mouseTop = 0

  constructor(option) {
    super(option)

    this._elSticky = this.el.querySelector('[data-button-sticky]')
    this._elStickyInner = this.el.querySelector('[data-button-sticky-inner]')

    this._elBorder = this.el.querySelector('[data-button-border]')

    if (this._elBorder) {
      const { width, height } = this.el
        .querySelector('[data-button-svg]')
        .getBBox()
      this._circumference = Math.ceil(
        Math.max(height / 2, width / 2) * 5.5167 // width: 60, height: 45 のときの円周率
      )
    }
  }

  onTick() {
    const { lerp, lerpLeave, rateLeft, rateTop, rateStickyInner } = param

    if (this._isHover) {
      const diffWidth = this.height - this.currentWidth
      if (Math.abs(diffWidth) < 0.01) {
        this.currentWidth = this.height
      } else {
        this.currentWidth += (this.height - this.currentWidth) * lerp
      }

      const diffLeft = this._mouseLeft - this.currentLeft
      if (Math.abs(diffLeft) < 0.01) {
        this.currentLeft = this._mouseLeft
      } else {
        this.currentLeft += (this._mouseLeft - this.currentLeft) * lerp
      }

      const diffTop = this._mouseTop - this.currentTop
      if (Math.abs(diffTop) < 0.01) {
        this.currentTop = this._mouseTop
      } else {
        this.currentTop += (this._mouseTop - this.currentTop) * lerp
      }
    } else {
      const diffWidth = this.width - this.currentWidth
      if (Math.abs(diffWidth) < 0.01) {
        this.currentWidth = this.width
      } else {
        this.currentWidth += (this.width - this.currentWidth) * lerpLeave
      }

      const diffLeft = 0 - this.currentLeft
      if (Math.abs(diffLeft) < 0.01) {
        this.currentLeft = 0
      } else {
        this.currentLeft += (0 - this.currentLeft) * lerpLeave
      }

      const diffTop = 0 - this.currentTop
      if (Math.abs(diffTop) < 0.01) {
        this.currentTop = 0
      } else {
        this.currentTop += (0 - this.currentTop) * lerpLeave
      }

      if (this.currentLeft === 0 && this.currentTop === 0) {
        this.pauseTick()
      }
    }
    const x = this.currentLeft * rateLeft
    const y = this.currentTop * rateTop
    if (!this._elBorder) {
      this._elSticky.style.width = this.currentWidth + 'px'
    }
    this._elSticky.style.transform = `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,${x},${y},0,1)`
    this._elStickyInner.style.transform = `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,${x *
      rateStickyInner},${y * rateStickyInner},0,1)`
  }

  onMouseenter() {
    this._isHover = true

    this.playTick()

    if (this._elBorder) {
      this.onMouseenterBorder()
    }
  }

  onMousemove(e) {
    this._mouseLeft = Math.min(e.offsetX, this.width) - this.centerHeight
    this._mouseTop = Math.min(e.offsetY, this.height) - this.centerHeight
  }

  onMouseleave() {
    if (this._elBorder) {
      this.onMouseleaveBorder()
    }

    this._isHover = false
  }

  onMouseenterBorder() {
    gsapK.to(this._elBorder, {
      strokeDashoffset: 0,
      duration: param.durationBorder,
      ease: param.easeBorder,
    })
  }

  onMouseleaveBorder() {
    gsapK.to(this._elBorder, {
      strokeDashoffset: this._circumference,
      duration: param.durationBorder,
      ease: param.easeBorder,
    })
  }

  onResize() {
    this._elSticky.style.width = ''
    this._elSticky.style.transform = ''

    this.width = this._elSticky.offsetWidth
    this.height = this._elSticky.offsetHeight
    this.centerWidth = this.width / 2
    this.centerHeight = this.height / 2
    this.currentWidth = this.width
    this.currentLeft = 0
    this.currentTop = 0

    if (this._elBorder) {
      gsap.set(this._elBorder, {
        strokeDasharray: `${this._circumference} ${this._circumference}`,
        strokeDashoffset: this._circumference,
      })
    }
  }
}
