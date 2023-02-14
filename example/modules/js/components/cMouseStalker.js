import gsap from 'gsap'
import gsapK from '~/utils/gsapK'
import Component from '~/parentClass/Component'
import eventBus from '~/events/eventBus'
import store from '~/managers/store'
import { getVariableSize } from '~/utils/dom'
import { isMobile } from '~/utils/navigator'

//
// パラメーター
//

const param = {
  lerpMouse: 0.05,
  lerpMouseMagnet: 0.1,
  durationShow: 0.8,
  easeShow: 'power2.out',
  durationHide: 0.5,
  easeHide: 'power2.out',
  translateX: 24,
  size: 20,
  sizeHover: 60,
  sizeLarge: 160,
  sizeNav: 120,

  durationMagnetShow: 0.6,
  easeMagnetShow: 'power4.out',
  durationMagnetHide: 0.5,
  easeMagnetHide: 'power2.out',

  durationMagnetTriggerShow: 1,
  easeMagnetTriggerShow: 'power3.out',
  durationMagnetTriggerHide: 0.2,
  easeMagnetTriggerHide: 'power2.out',
  delayMagnetTriggerShow: 0.2,

  widthMagnetCirclePc: 64,
}

//
// main
//

export default class CMouseStalker extends Component {
  static componentName = 'CMouseStalker'
  _isHover = false
  positionTarget = {
    x: 0,
    y: 0,
  }
  positionElement = {
    x: 0,
    y: 0,
  }

  constructor(option = {}) {
    super({
      isAutoPlayTick: !isMobile,
      isPermanent: true,
    })

    if (isMobile) {
      this.el.remove()
      this.destroy()
      return
    }

    this._lerpMouse = param.lerpMouse

    this._elBorder = this.el.querySelector('[data-mouse-stalker-border]')
    this._elArrow = this.el.querySelector('[data-mouse-stalker-arrow]')
    this._elArrowSvg = this.el.querySelector('[data-mouse-stalker-arrow-svg]')
    this._elNext = this.el.querySelector('[data-mouse-stalker-next]')
    this._elBack = this.el.querySelector('[data-mouse-stalker-back]')

    this.mouseenterTrigger = this.mouseenterTrigger.bind(this)
    eventBus.on('mouseenterMouseStalkerTrigger', this.mouseenterTrigger)

    this.mouseleaveTrigger = this.mouseleaveTrigger.bind(this)
    eventBus.on('mouseleaveMouseStalkerTrigger', this.mouseleaveTrigger)
  }

  mouseenterTrigger(type, rectMagnet, isFixed) {
    if (store.isTransition) return

    this._isHover = true
    this._type = type

    gsap.set(this.el, {
      top: 0,
    })

    if (this._classNameType) {
      this.el.classList.remove(this._classNameType)
      this._classNameType = null
    }

    if (this._type) {
      this._classNameType = `-${this._type}`
      this.el.classList.add(this._classNameType)
    }

    this._isMagnet = !!rectMagnet
    if (this._isMagnet) {
      this._isMagnetNotFixed = !isFixed

      this._initialScrollY = store.scrollYSmooth

      const { left, top, width, height } = rectMagnet

      this._lerpMouse = param.lerpMouseMagnet

      this.positionTarget.x = this.positionElement.x = left + width / 2
      this.positionTarget.y = this.positionElement.y = top + height / 2

      gsapK.to(this.el, {
        x: left + width / 2,
        y: top + height / 2,
        duration: param.durationMagnetShow,
        ease: param.easeMagnetShow,
      })
      gsapK.to(this._elBorder, {
        width,
        height,
        opacity: 0,
        duration: param.durationShow,
        ease: param.easeShow,
      })

      if (this._type === 'magnetBorder') {
        gsapK.to(this._elBorder, {
          width,
          height,
          duration: param.durationMagnetShow,
          ease: param.easeMagnetShow,
        })
      }
    } else {
      const sizePrev = this._size

      this._size = (() => {
        switch (this._type) {
          case 'large':
          case 'white':
          case 'red':
            return 'large'
          case 'back':
          case 'next':
            return 'nav'
          default:
            return 'default'
        }
      })()

      const size =
        this._size === 'large'
          ? param.sizeLarge
          : this._size === 'nav'
          ? param.sizeNav
          : param.sizeHover

      gsapK.to(this._elBorder, {
        width: size,
        height: size,
        duration: param.durationShow,
        ease: param.easeShow,
      })

      if (this._size === 'large' || this._size === 'nav') {
        if (sizePrev === this._size && this.tweenNav) {
          this.tweenNav.kill()
        }
        this.tweenNav = gsapK.to(
          this._size === 'large'
            ? this._elArrow
            : this._type === 'back'
            ? this._elBack
            : this._elNext,
          {
            opacity: 1,
            duration: param.durationShow,
            ease: param.easeShow,
          }
        )

        if (this._size === 'large') {
          if (this.tweenArrow) {
            this.tweenArrow.kill()
          }
          this.tweenArrow = gsapK.fromTo(
            this._elArrowSvg,
            {
              x: param.translateX * (this._type === 'back' ? 1 : -1),
            },
            {
              x: 0,
              duration: param.durationShow,
              ease: param.easeShow,
            }
          )
        }
      }
    }
  }

  mouseleaveTrigger(isForce) {
    if (!isForce && store.isTransition) return

    this._isHover = false

    gsapK.to(this._elBorder, {
      width: param.size,
      height: param.size,
      opacity: 1,
      duration: param.durationHide,
      ease: param.easeHide,
    })

    if (this._isMagnet) {
      this._isMagnetNotFixed = false

      this.el.classList.remove(this._classNameType)

      this._isMagnet = false
      this._lerpMouse = param.lerpMouse

      gsapK.to(this.el, {
        opacity: 1,
        top: 0,
        duration: param.durationHide,
        ease: param.easeHide,
      })
    } else {
      if (this._size === 'large' || this._size === 'nav') {
        if (this.tweenNav) {
          this.tweenNav.kill()
        }
        this.tweenNav = gsapK.to(
          this._size === 'large'
            ? this._elArrow
            : this._type === 'back'
            ? this._elBack
            : this._elNext,
          {
            opacity: 0,
            duration: param.durationHide,
            ease: param.easeHide,
            onComplete: () => {
              if (this._isHover) return
              if (this._classNameType) {
                this.el.classList.remove(this._classNameType)
              }
            },
          }
        )

        if (this._size === 'large') {
          if (this.tweenArrow) {
            this.tweenArrow.kill()
          }
          this.tweenArrow = gsapK.to(this._elArrowSvg, {
            x: param.translateX * (this._type === 'back' ? -1 : 1),
            duration: param.durationHide,
            ease: param.easeHide,
          })
        }
      }
    }
  }

  onMousemoveDocument(x, y) {
    if (this._isMagnet) return

    this.positionTarget.x = x
    this.positionTarget.y = y
  }

  onScroll(y) {
    if (!this._isMagnetNotFixed) return

    gsap.set(this.el, {
      top: -(y - this._initialScrollY),
    })
  }

  onTick() {
    if (this._isMagnet) return

    this.positionElement.x +=
      (this.positionTarget.x - this.positionElement.x) * this._lerpMouse
    this.positionElement.y +=
      (this.positionTarget.y - this.positionElement.y) * this._lerpMouse
    gsap.set(this.el, {
      x: this.positionElement.x,
      y: this.positionElement.y,
    })
  }

  onLeave() {
    this.mouseleaveTrigger(true)
  }

  destroy() {
    this.onDestroy()
  }
}

export class CMouseStalkerTrigger extends Component {
  static selectorRoot = '[data-mouse-stalker-trigger]'
  _progress = 0

  constructor(option) {
    super(option)

    this._type = this.el.dataset.mouseTrigger
    this._isFixed = 'mouseTriggerFixed' in this.el.dataset

    if (this._type === 'magnet') {
      this._elMagnet = this.el.querySelector(
        '[data-mouse-stalker-trigger-magnet]'
      )
      this._elMagnetCircle = document.createElement('div')
      this._elMagnetCircle.classList.add('cButton-magnetCircle')
      this._elMagnet.append(this._elMagnetCircle)

      gsap.set(this._elMagnetCircle, {
        scale: 0,
      })
    } else if (this._type === 'magnetBorder') {
      this._elMagnet = this.el.querySelector(
        '[data-mouse-stalker-trigger-magnet]'
      )
    }
  }

  onMouseenter() {
    eventBus.emit(
      'mouseenterMouseStalkerTrigger',
      this._type,
      this._elMagnet?.getBoundingClientRect(),
      this._isFixed
    )

    if (this._elMagnetCircle) {
      const widthMagnetCircle = getVariableSize(param.widthMagnetCirclePc)

      gsapK.to(this, {
        _progress: 1,
        duration: param.durationMagnetTriggerShow,
        ease: param.easeMagnetTriggerShow,
        delay: param.delayMagnetTriggerShow,
        onUpdate: () => {
          const size = widthMagnetCircle * (1 - this._progress)
          gsap.set(this._elMagnetCircle, {
            scale: this._progress,
            boxShadow: `0 0 ${size * 0.4}px ${size / 2}px #e94709`,
          })
        },
      })
    }
  }

  onMouseleave() {
    eventBus.emit('mouseleaveMouseStalkerTrigger')

    if (this._elMagnetCircle) {
      const widthMagnetCircle = getVariableSize(param.widthMagnetCirclePc)

      gsapK.to(this, {
        _progress: 0,
        duration: param.durationMagnetTriggerHide,
        ease: param.easeMagnetTriggerHide,
        onUpdate: () => {
          const size = widthMagnetCircle * (1 - this._progress)
          gsap.set(this._elMagnetCircle, {
            scale: this._progress,
            boxShadow: `0 0 ${size * 0.4}px ${size / 2}px #e94709`,
          })
        },
      })
    }
  }
}
