import { gsap } from 'gsap'
import Component from '~/parentClass/Component'

//
// main
//

export class CHoverSticky extends Component {
  static selectorRoot = '[data-hover-sticky]'

  constructor(option) {
    super(option)

    this._elLKeywordPhoto = this.el.querySelector('[data-hover-sticky-object]')

    this.onResize()
  }

  onMouseenter() {
    this.el.classList.add('-active')
  }

  onMousemove(e) {
    gsap.set(this._elLKeywordPhoto, {
      x: e.offsetX - (this._width + this._widthPhoto * 0.4),
      y: e.offsetY + this._height * 1.2,
    })
  }

  onMouseleave() {
    this.el.classList.remove('-active')
  }

  onResize() {
    const { width, height } = this._elRoot.getBoundingClientRect()
    const { width: widthPhoto } = this._elLKeywordPhoto.getBoundingClientRect()
    this._width = width
    this._height = height
    this._widthPhoto = widthPhoto
  }
}
