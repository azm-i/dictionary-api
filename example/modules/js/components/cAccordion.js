import Component from '~/parentClass/Component'
import passive from '~/utils/passive'
import gsapK from '~/utils/gsapK'
import { emitResize } from '~/events/window'

//
// main
//

export default class CAccordion extends Component {
  static selectorRoot = '[data-accordion]'
  isOpen = false
  isAnimating = false

  constructor(option) {
    super(option)

    this.elsTrigger = this.el.querySelectorAll('[data-accordion-trigger]')
    this.elContent = this.el.querySelector('[data-accordion-content]')
    if (this.elsTrigger.length === 0 || !this.elContent) return

    gsapK.set(this.elContent, {
      overflow: 'hidden',
      height: 0,
    })

    this._onClickTrigger = this.clickTrigger.bind(this)
    this.elsTrigger.forEach((el) => {
      el.addEventListener('click', this._onClickTrigger, passive)
    })
  }

  clickTrigger() {
    if (!this.isOpen) {
      this.open()
    } else {
      this.close()
    }
  }

  open() {
    if (this.isAnimating || this.isOpen) return
    this.isOpen = true
    this.isAnimating = true

    this.elsTrigger.forEach((el) => {
      el.classList.add('-open')
    })
    this.elContent.style.willChange = 'height'

    gsapK.to(this.elContent, {
      height: 'auto',
      duration: 0.7,
      ease: 'power4.out',
      onComplete: () => {
        emitResize(true)
        this.elContent.style.willChange = 'auto'
        this.isAnimating = false
      },
    })
  }

  close() {
    if (this.isAnimating || !this.isOpen) return
    this.isOpen = false
    this.isAnimating = true

    this.elsTrigger.forEach((el) => {
      el.classList.remove('-open')
    })
    this.elContent.style.willChange = 'height'

    gsapK.to(this.elContent, {
      height: 0,
      duration: 0.65,
      ease: 'power4.out',
      onComplete: () => {
        emitResize(true)
        this.elContent.style.willChange = 'auto'
        this.isAnimating = false
      },
    })
  }

  onDestroy() {
    this.elsTrigger.forEach((el) => {
      el.addEventListener('click', this._onClickTrigger, passive)
    })
    this._onClickTrigger = null

    this.elsTrigger = null
    this.elContent = null

    super.onDestroy()
  }
}
