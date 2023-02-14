import Component from '~/parentClass/Component'
import { getSafeWindowHeight } from '~/utils/dom'

export default class COrientationAlert extends Component {
  isShow = false

  constructor() {
    super({
      el: document.querySelector('[data-c-orientation-alert]'),
      isPermanent: true,
    })
  }

  onOrientationchange(isHorizontal) {
    if (!this.isSp) return

    if (isHorizontal) {
      // 横向き
      if (!this.isShow) {
        this.isShow = true
        this.el.style.display = 'block'
      }
    } else {
      // 縦向き
      if (this.isShow) {
        this.isShow = false
        this.el.style.display = 'none'
      }
    }
  }

  onResize() {
    this.el.style.height = getSafeWindowHeight() + 'px'
  }
}
