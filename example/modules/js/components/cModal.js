import Component from '~/parentClass/Component'
import passive from '~/utils/passive'
import gsapK from '~/utils/gsapK'
import eventBus from '~/events/eventBus'
import store from '~/managers/store'
import { getVariableSize } from '~/utils/dom'

//
// パラメーター
//

const MOVE_CONTENTS = 270

//
// main
//

export default class CModal extends Component {
  static componentName = 'cModal'

  onInit() {
    const { el } = this
    this.id = el.dataset.modal
    this.elBody = document.body
    this.elContentBgTop = this.el.querySelector('.cModal-contentBg.-top')
    this.elContentBgBottom = this.el.querySelector('.cModal-contentBg.-bottom')
    this.elContentBgs = [this.elContentBgTop, this.elContentBgBottom]

    gsapK.set(this.refs.content, {
      scaleY: 0,
    })

    this.refs.content.style.willChange = 'opacity, transform'
    gsapK.set(this.refs.content, {
      opacity: 0,
    })
    if (this.refs.backdrop) {
      this.refs.backdrop.style.willChange = 'opacity'
      gsapK.set(this.refs.backdrop, {
        opacity: 0,
      })
    }

    this.refs.content.addEventListener(
      'click',
      (e) => {
        e.stopPropagation()
      },
      passive
    )

    const onClick = (el) => {
      el.style.willChange = 'opacity'
      gsapK.set(el, {
        opacity: 0,
      })

      el.addEventListener(
        'click',
        (e) => {
          e.stopPropagation()
          eventBus.emit('closeModal', this.id)
        },
        passive
      )
    }
    if (this.refs.close.length > 0) {
      this.refs.close.forEach((el) => {
        onClick(el)
      })
    } else {
      onClick(this.refs.close)
    }

    store.modals[this.id] = this
  }

  onClick(e) {
    e.stopPropagation()
    eventBus.emit('closeModal', this.id)
  }

  open(onComplete) {
    this.el.classList.add('-open')
    this.elBody.classList.add('-open')

    gsapK.to(this.refs.content, {
      scaleY: 1,
      duration: 1,
      ease: 'expo.out',
      onComplete: this.refs.backdrop ? null : onComplete,
    })
    gsapK.to(this.refs.content, {
      opacity: 1,
      duration: 0.6,
      scrollTop: 0,
      ease: 'power2.out',
    })
    gsapK.to(this.refs.close, {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
      delay: 0.2,
    })
    if (this.refs.backdrop) {
      gsapK.to(this.refs.backdrop, {
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out',
        onComplete,
      })
    }
  }

  close(onComplete, isNoAnimation = false) {
    gsapK.to(this.refs.content, {
      scaleY: 0,
      duration: isNoAnimation ? 0.01 : this.isSp ? 0.8 : 0.5,
      ease: 'expo.out',
      onComplete: this.refs.backdrop
        ? null
        : () => {
            this.el.classList.remove('-open')
            this.elBody.classList.remove('-open')
            if (onComplete) onComplete()
          },
    })
    gsapK.to(this.refs.content, {
      opacity: 0,
      duration: isNoAnimation ? 0.01 : this.isSp ? 0.6 : 0.35,
      ease: 'power2.out',
    })
    gsapK.to(this.refs.close, {
      opacity: 0,
      duration: isNoAnimation ? 0.01 : this.isSp ? 0.6 : 0.35,
      ease: 'power2.out',
    })
    if (this.refs.backdrop) {
      gsapK.to(this.refs.backdrop, {
        opacity: 0,
        duration: isNoAnimation ? 0.01 : 0.45,
        ease: 'power3.out',
        onComplete: () => {
          this.el.classList.remove('-open')
          this.elBody.classList.remove('-open')
          if (onComplete) onComplete()
        },
      })
    }
  }

  onLeave() {
    gsapK.to(this.refs.content, {
      y: getVariableSize(MOVE_CONTENTS),
      duration: 1.5,
      ease: 'power3.out',
      clearProps: 'transform',
    })
  }
}
