import Component from '~/parentClass/Component'

//
// パラメーター
//

// const param = {
// }

//
// main
//

export default class CMenu extends Component {
  static componentName = 'cMenu'
  static isPermanent = true

  // onInit() {
  // }

  // onOpenModal(id) {
  //   if (id !== 'menu') return

  //   // do something
  // }

  // onCloseModal(id) {
  //   if (id !== 'menu') return

  //   // do something
  // }

  onLeaveCompleted() {
    this.emit('closeModal', this.id, true)
  }
}
