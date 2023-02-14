import Page from '~/parentClass/Page'
import LKv from '~/pages/index/lKv'

//
// main
//

class PageCurrent extends Page {
  constructor() {
    super({
      // isAutoPlayTick: true,
    })
  }

  onMount() {
    // console.log('onMount')
    // this.playTick()
  }

  onInit() {
    // console.log('onInit')
    this.lKv = new LKv()
  }

  onTick(time, count, rateFps) {
    // console.log('onTick', time, count, rateFps)
  }

  onMouseenter() {
    // console.log('onMouseenter')
  }

  onMousemove() {
    // console.log('onMousemove')
  }

  onMouseleave() {
    // console.log('onMouseleave')
  }

  onScroll(y, obj) {
    // console.log('onScroll', y, obj)
  }

  onCall(value, way, obj) {
    // console.log('onCall', value, way, obj)
  }

  onResetSize(isForce) {
    // console.log('onResetSize', isForce)
  }

  onResize(isForce) {
    // console.log('onResize', isForce, this.isSp)
  }

  onResizeAlways(isForce) {
    // console.log('onResizeAlways', isForce)
  }

  onOrientationchange(isHorizontal) {
    // console.log('onOrientationchange', isHorizontal)
  }

  onDestroy() {
    // console.log('onDestroy')

    super.onDestroy()
  }
}
new PageCurrent()
