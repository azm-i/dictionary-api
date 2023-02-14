import Component from '~/parentClass/Component'
import eventBus from '~/events/eventBus'

//
// main
//

export default class ModalTrigger extends Component {
  static selectorRoot = '[data-modal-trigger]'
  isOpen = false

  constructor(option) {
    super(option)

    this.id = this.el.dataset.modalTrigger
    this.on('closeModal', () => {
      this.isOpen = false
    })
    this.on('leave', () => {
      this.isOpen = false
    })
  }

  onClick() {
    if (!this.isOpen) {
      eventBus.emit('openModal', this.id)
      this.isOpen = true
    } else {
      eventBus.emit('closeModal', this.id)
      this.isOpen = false
    }
  }
}
