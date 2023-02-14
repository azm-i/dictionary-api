import * as THREE from 'three'
import ThreeRenderer from '~/parentClass/ThreeRenderer'

import Shape from '~/components/cBackground/shape'

//
// main
//

export default class CBackground extends ThreeRenderer {
  static componentName = 'cBackground'
  static isPermanent = true

  onInit() {
    super.onInit({
      // isManual: true,
      isPermanent: true,
      isAutoPlayTick: true,
      isFullSize: true,
      // pixelRatio: 1.5,
      // fps: 30,
    })
  }

  init() {
    super.init()

    this.group = new THREE.Group()

    this.shape = new Shape()
    this.shape.init()

    this.group.add(this.shape.mesh)

    this.scene.add(this.group)

    // ポストプロセス
    // this.gradationPass = new GradationPass()
    // this.initPostProcessing(this.gradationPass)

    this.resize()

    this.playTick()
  }

  onCompleteOpenModal() {
    this.pauseTick()
  }

  onStartCloseModal() {
    this.playTick()
  }

  onEnter(pageId, pageIdPrev) {
    this.shape.enter(pageId, pageIdPrev)
  }

  onTick(time) {
    this.shape.tick(time)

    super.onTick()
  }

  onResize() {
    super.onResize()

    this.shape.resize(this.width, this.height)
  }

  onScroll(y) {
    // this.group.position.y = y
  }
}
