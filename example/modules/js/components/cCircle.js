import gsapK from '~/utils/gsapK'
import Component from '~/parentClass/Component'

//
// main
//

export default class CCircle extends Component {
  circumference = 0

  constructor(option) {
    super(option)

    this._elPath = this.el.querySelector('[data-circle-path]')
    this.circumference = this._elPath.dataset?.circlePath || 0
  }

  setProgress(progress) {
    gsap.set(this._elPath, {
      strokeDashoffset: this.circumference * (1 - progress),
    })
  }

  show(duration, ease) {
    gsapK.to(this._elPath, {
      strokeDashoffset: this.circumference * (1 - 1),
      duration,
      ease,
    })
  }

  hide(duration, ease) {
    gsapK.to(this._elPath, {
      strokeDashoffset: this.circumference * (1 - 0),
      duration,
      ease,
    })
  }
}
