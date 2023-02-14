import Component from '~/parentClass/Component'
import store from '~/managers/store'
import eventBus from '~/events/eventBus'

//
// main
//

export default class AnchorLink extends Component {
  static selectorRoot = 'a[href*="#"]:not([href="#"])'

  onInit() {
    this.isDisableHash = 'disableHash' in this.el.dataset
    this.to = this.el.getAttribute('href')
  }

  onClick(event) {
    const { cScroll } = store

    if (cScroll.isDisable) return

    if (this.to === '#top') {
      event.preventDefault()
      if (!this.isDisableHash && location.hash) {
        window.history.pushState(null, '', location.pathname)
      }
      store.isAnchor = true
      this.detectOpenModal()
      return
    }

    const path = location.pathname

    if (!this.to.startsWith('#') && !this.to.includes(path)) return

    const elTarget = document.querySelector(this.el.hash)
    if (elTarget) {
      event.preventDefault()
      if (!this.isDisableHash) {
        window.history.pushState(null, '', this.to)
      }
      store.isAnchor = true
      this.detectOpenModal(elTarget)
    }
  }

  detectOpenModal(target) {
    if (store.isOpenModal) {
      eventBus.emit('closeModal')
      requestAnimationFrame(() => {
        this.scrollTo(target)
      })
    } else {
      this.scrollTo(target)
    }
  }

  scrollTo(target = 0) {
    store.cScroll.scrollTo(target, {
      onComplete: () => {
        store.isAnchor = false
      },
    })
  }
}
