import Component from '~/parentClass/Component'
import { addMouseenterListener, addMouseleaveListener } from '~/utils/mouse'

//
// main
//

export default class CHoverGroup extends Component {
  static selectorRoot = '[data-hover-group]'

  constructor(option) {
    super(option)

    const elsItem = this.el.querySelectorAll('[data-hover-group-item]')
    elsItem.forEach((elCurrent, iCurrent) => {
      addMouseenterListener(elCurrent, () => {
        elsItem.forEach((el, i) => {
          if (i === iCurrent) {
            elCurrent.classList.remove('-inactive')
          } else {
            el.classList.add('-inactive')
          }
        })
      })
      addMouseleaveListener(elCurrent, () => {
        elsItem.forEach((el, i) => {
          el.classList.remove('-inactive')
        })
      })
    })
  }
}
