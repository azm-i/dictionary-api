export default function init({ transitions }) {
  require('~/events/load').init()
  if (process.env.enableEventTick) {
    require('~/events/tick').init()
  }
  if (process.env.enableEventWindow) {
    require('~/events/window').init()
  }
  if (process.env.enableEventScroll) {
    require('~/events/scroll').init()
  }
  if (process.env.enableEventMouse) {
    require('~/events/mouse').init()
  }
  if (process.env.enableEventAsynchronousTransition) {
    require('~/events/asynchronousTransition').init(transitions)
  }
}
