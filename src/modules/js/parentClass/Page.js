import Component from '~/parentClass/Component'
import eventBus from '~/events/eventBus'

export default class Page extends Component {
  /**
   *Creates an instance of Page.
   * @param {Object} [option={}]
   * @param {Element} [option.el=document.body]
   * @param {boolean} [option.isAutoPlayTick=false] tickを自動実行するか
   * @memberof Page
   */
  constructor(option = {}) {
    const { el = document.body } = option
    option.isManualOnMount = true

    super({ el, ...option })

    if (this.onInit) {
      eventBus.once('initPageJs', () => {
        this.onInit()
      })
    }

    eventBus.emit('readyPage')
  }
}
