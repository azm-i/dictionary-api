import Component from '~/parentClass/Component'

//
// main
//

export default class CMarquee extends Component {
  static componentName = 'cMarquee'

  onInit() {
    this.refs.text.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;'
    const count = Math.ceil(window.innerWidth / this.refs.text.offsetWidth)
    const { textContent } = this.refs.text
    let text = ''
    for (let i = 0; i < count; i = (i + 1) | 0) {
      text += textContent
    }
    this.refs.text.innerHTML = text

    const cloneElement = this.refs.text.cloneNode(true)
    this.refs.line.appendChild(cloneElement)
  }

  play() {
    this.el.classList.remove('-pause')
  }

  pause() {
    this.el.classList.add('-pause')
  }
}
