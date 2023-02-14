const eventBus = (window.sdEventBus = window.sdEventBus || {
  listeners: {},

  emit(name, ...args) {
    if (!this.listeners[name]) return
    const listenerCurrent = this.listeners[name].slice()
    for (let i = 0; i < listenerCurrent.length; i++) {
      listenerCurrent[i](...args)
    }
  },

  on(name, listener) {
    if (!this.listeners[name]) {
      this.listeners[name] = []
    }
    this.listeners[name].push(listener)
  },

  once(name, listener) {
    if (!this.listeners[name]) {
      this.listeners[name] = []
    }
    const listenerNew = () => {
      this.off(name, listenerNew)
      listener()
    }
    this.listeners[name].push(listenerNew)
  },

  off(name, listener) {
    const listenerCurrent = this.listeners[name]
    if (!listenerCurrent || listenerCurrent.length === 0) return

    listenerCurrent.some((value, i) => {
      if (value === listener) {
        listenerCurrent.splice(i, 1)
        return true
      }
      return false
    })
    if (listenerCurrent.length === 0) {
      delete this.listeners[name]
    }
  },
})

export default eventBus
