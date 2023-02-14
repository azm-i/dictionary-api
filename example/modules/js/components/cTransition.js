import store from '~/managers/store'
import Component from '~/parentClass/Component'
import { getVariableSize } from '~/utils/dom'
import gsapK from '~/utils/gsapK'

//
// パラメーター
//

const param = {
  durationDoor: 1,
  easeDoorClose: 'slide',
  easeDoorCloseInner: 'power2.out',
  easeDoorOpen: 'quart.inOut',

  delayDoor: 0,
  durationDoorInner: 1.4,
  delayDoorInner: 0.2,

  durationRateHide: 0.9,

  scaleYDoorInnerOpen: 0.5,
  delayDoorInnerOpen: 0.1,

  moveContents: 250,

  durationRateContentsClose: 1.5,
  easeContentsClose: 'power3.out',
  delayContentsOpen: 0.3,
}

//
// main
//

export default class CTransition extends Component {
  static componentName = 'cTransition'
  static isPermanent = true

  onInit() {
    gsap.set(this.refs.door, {
      yPercent: -101,
      force3D: true,
    })
    gsap.to(this.refs.doorInner, {
      scaleY: 1,
      force3D: true,
    })
  }

  async onLeave() {
    // 遷移離脱時
    this.el.style.display = 'block'
    await this.show()

    // 遷移アニメーション表示完了後に以下を実行
    this.emit('leaveEnd')
  }

  async onEnterReady() {
    // 次ページ表示時
    await this.hide()
    this.el.style.display = 'none'

    // 遷移アニメーション非表示完了後に以下を実行
    this.emit('enterEnd')
  }

  show() {
    const easeClose = param.easeDoorClose

    gsapK.to(store.elTransitionContents, {
      y: getVariableSize(param.moveContents),
      duration: param.durationDoor * param.durationRateContentsClose,
      ease: param.easeContentsClose,
      force3D: true,
    })

    return gsap.timeline().add([
      gsap.to(this.refs.door, {
        yPercent: 0,
        duration: param.durationDoor,
        ease: easeClose,
        delay: param.delayDoor,
        force3D: true,
      }),
      gsap.to(this.refs.doorInner, {
        scaleY: 0,
        duration: param.durationDoorInner,
        ease: param.easeDoorCloseInner,
        delay: param.delayDoorInner,
        force3D: true,
      }),
    ])
  }

  hide() {
    const duration = param.durationDoor * param.durationRateHide
    const easeOpen = param.easeDoorOpen

    gsapK.fromTo(
      store.elTransitionContents,
      {
        y: getVariableSize(param.moveContents),
      },
      {
        y: 0,
        duration:
          duration * param.durationRateContentsClose - param.delayContentsOpen,
        ease: param.easeContentsClose,
        delay: param.delayContentsOpen,
        force3D: true,
        clearProps: 'transform',
      }
    )

    return gsap.timeline().add([
      gsap.to(this.refs.door, {
        yPercent: -101,
        duration,
        ease: easeOpen,
        delay: param.delayDoorInner,
        force3D: true,
      }),
      gsap.to(this.refs.doorInner, {
        scaleY: param.scaleYDoorInnerOpen,
        duration,
        ease: easeOpen,
        delay: param.delayDoorInnerOpen,
        force3D: true,
      }),
    ])
  }
}
