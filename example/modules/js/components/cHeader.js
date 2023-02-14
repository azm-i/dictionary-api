import Component from '~/parentClass/Component'

//
// パラメーター
//

// const param = {
// }

//
// main
//

export default class CHeader extends Component {
  static componentName = 'cHeader'
  static isPermanent = true
  isMenu = false

  onInit() {
    if (this.isSp) {
      this.showMenu()
    }
  }

  hideMenu() {
    if (!this.isMenu) return
    this.isMenu = false

    this.el.classList.remove('-menu')
  }

  showMenu() {
    if (this.isMenu) return
    this.isMenu = true

    this.el.classList.add('-menu')
  }

  onCall(value, way, obj) {
    if (this.isSp) return

    // 下へスクロールしたら非表示にする
    if (value === 'scrollDown') {
      if (way === 'enter') {
        this.hideMenu()
      } else if (way === 'exit') {
        this.showMenu()
      }
    }
  }
}
