//
// state
//

const state = {
  components: [],
  instances: null,
}

//
// main
//

export function addComponents(components) {
  state.components = components
}

export function initComponents(context = document, isPermanent = false) {
  if (isPermanent) {
    state.components.forEach((Class) => {
      Class.createAll(context, { isPermanent })
    })
  } else {
    state.instances = state.components.map((Class) => Class.createAll(context))
  }

  if (!isPermanent) {
    moveElFixedLocal(context)
  }
}

export function destroyComponents() {
  state.instances = null
}

/**
 * ページ固有モーダルのHTMLを非同期遷移対象要素外へ移動
 */
function moveElFixedLocal(context) {
  const elFixedLocal = context.querySelector('[data-fixed-local]')
  if (!elFixedLocal) return

  const elFixedLocalContainer = document.querySelector(
    '[data-fixed-local-container]'
  )
  elFixedLocalContainer.innerHTML = ''
  document
    .querySelector('[data-fixed-local-container]')
    .appendChild(elFixedLocal)
}
