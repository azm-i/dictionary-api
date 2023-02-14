import Component from '~/parentClass/Component'
import MFlicker from '~/motions/mFlicker'

//
// main
//

export default class CTitle extends Component {
  static componentName = 'cTitle'
  isPlayed = false

  onInit() {
    this.motion = new MFlicker(this.el)
  }

  onInView() {
    if (this.isPlayed) return
    this.isPlayed = true

    this.show()
  }

  show() {
    this.el.classList.add('-show')
    this.motion.show()
  }
}
