import Component from '~/parentClass/Component'

//
// main
//

export default class LKv extends Component {
  static componentName = 'lKv'

  onInit() {
    console.log({
      el: this.el,
      refs: this.refs,
    })
  }
}
