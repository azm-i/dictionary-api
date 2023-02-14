import * as THREE from 'three'
import { EffectComposer, RenderPass } from 'postprocessing'
import Component from '~/parentClass/Component'
import {
  getSafeWindowHeight,
  getSafeWindowWidth,
  getVariableSize,
} from '~/utils/dom'

export default class ThreeRenderer extends Component {
  /**
   * Creates an instance of ThreeRenderer.
   * @param {Object} [option={}]
   * @param {boolean} [option.width=this.el.clientWidth] canvas の幅
   * @param {boolean} [option.height=this.el.clientHeight] canvas の高さ
   * @param {boolean} [option.alpha=true] canvas を透過させるかどうか
   * @param {boolean} [option.stencil=false]
   * @param {boolean} [option.isManual=false] 手動で初期化するかどうか
   * @memberof ThreeRenderer
   */
  onInit(option = {}) {
    this._count = 0
    this._isInit = false
    this.isLooseContext = false

    const {
      isFullSize = false,
      width = isFullSize ? window.innerWidth : this.el.clientWidth,
      height = isFullSize
        ? Math.max(window.innerHeight, this.el.clientHeight)
        : this.el.clientHeight,
      fps = 60,
      pixelRatio,
      pixelRatioAbsolute,
      alpha = true,
      stencil = false,
      powerPreference = 'low-power',
      isManual = false,
    } = option

    this.isFullSize = isFullSize
    this.width = this._initialWidth = width
    this.height = this._initialHeight = height
    this._isSpecifiedWidth = 'width' in option && width !== this.el.clientWidth
    this._isSpecifiedHeight =
      'height' in option && height !== this.el.clientHeight
    this.framerate = 60 / fps
    this.alpha = alpha
    this.stencil = stencil
    this.powerPreference = powerPreference
    this.pixelRatio = pixelRatio || pixelRatioAbsolute
    this._isFixedPixelRatio = 'pixelRatio' in option
    this._isFixedPixelRatioAbsolute = 'pixelRatioAbsolute' in option

    this.onWebglcontextlost = this.onWebglcontextlost.bind(this)

    if (!isManual) {
      this.init()
    }
  }

  init() {
    if (this._isInit) return
    this._isInit = true

    this.initRenderer()

    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera()
  }

  initPostProcessing(passes) {
    if (!(passes.length > 0)) {
      passes = [passes]
    }

    const { renderer, scene, camera } = this

    const size = renderer.getSize(new THREE.Vector2())
    const pixelRatio = renderer.getPixelRatio()
    size.width *= pixelRatio
    size.height *= pixelRatio

    const composer = (this._composer = new EffectComposer(
      renderer,
      new THREE.WebGLRenderTarget(size.width, size.height, {
        depthBuffer: false,
        stencilBuffer: false,
      })
    ))

    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    for (let i = 0; i < passes.length; i++) {
      const pass = passes[i]
      pass.renderToScreen = i === passes.length - 1
      composer.addPass(pass)
    }

    renderer.autoClear = false
  }

  render() {
    if (this._composer) {
      this._composer.render()
    } else if (this.renderer) {
      this.renderer.render(this.scene, this.camera)
    }
  }

  onTick() {
    if (this._count++ % this.framerate !== 0) return

    this.render()
  }

  resize() {
    if (!this._isInit) return

    const windowWidth = getSafeWindowWidth()

    const { el, renderer, camera } = this
    const pixelRatio = this._isFixedPixelRatioAbsolute
      ? this.pixelRatio
      : this._isFixedPixelRatio
      ? Math.min(this.pixelRatio, window.devicePixelRatio)
      : window.devicePixelRatio

    el.style.width = ''
    el.style.height = ''
    let width = this.isFullSize
      ? windowWidth
      : this._isSpecifiedWidth
      ? getVariableSize(this._initialWidth)
      : el.clientWidth
    const height = this.isFullSize
      ? Math.max(getSafeWindowHeight(), el.clientHeight)
      : this._isSpecifiedHeight
      ? getVariableSize(this._initialHeight)
      : el.clientHeight
    if (!this._isSpecifiedWidth && height > width) {
      width = height
    }
    this.width = width
    this.height = height

    camera.aspect = width / height
    camera.position.z =
      Math.min(width, height) / 2 / Math.tan((camera.fov / 2) * (Math.PI / 180))
    camera.far = camera.position.z + 1
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
    renderer.setPixelRatio(pixelRatio)

    el.style.margin = `0 ${-(this.width - windowWidth) / 2}px`

    if (this._composer) {
      this._composer.setSize(width, height)
    }

    requestAnimationFrame(() => {
      this.render()
    })
  }

  onResize() {
    this.resize()
  }

  onWebglcontextlost() {
    this.isLooseContext = true
    this.disposeRenderer()
  }

  initRenderer() {
    if (this.renderer) return
    this.isLooseContext = false

    this.renderer = new THREE.WebGLRenderer({
      alpha: this.alpha,
      stencil: this.stencil,
      powerPreference: this.powerPreference,
    })
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    // this.renderer.setClearColor(0xffffff, 0)
    this.domElement = this.renderer.domElement
    this.el.appendChild(this.domElement)

    // ページ遷移し続けてcontextが失われたら、再度contextを生成しなおす
    this.domElement.addEventListener(
      'webglcontextlost',
      this.onWebglcontextlost
    )
  }

  disposeRenderer() {
    this.domElement.removeEventListener(
      'webglcontextlost',
      this.onWebglcontextlost
    )

    if (this.renderer) {
      const gl = this.renderer.getContext()
      if (gl.getExtension('WEBGL_lose_context')) {
        this.renderer.forceContextLoss()
      }

      this.renderer.dispose()
      this.el.removeChild(this.domElement)
      this.renderer.domElement = null
      this.renderer = null
    }
  }

  disposeGeometry(geometry) {
    if (geometry) {
      geometry.dispose()
      geometry = null
    }
  }

  disposeMaterial(material) {
    if (material && Array.isArray(material)) {
      material.forEach((material) => this.disposeMaterialSingle(material))
    } else if (material) {
      this.disposeMaterialSingle(material)
    }
  }

  disposeMaterialSingle(material) {
    if (material.map) {
      material.map.dispose()
      material.map = null
    }
    material.dispose()
    material = null
  }

  setGroupOpacity(obj, opacity) {
    if (obj.material) {
      obj.material.opacity = opacity
    } else {
      obj.children.forEach((child) => {
        this.setGroupOpacity(child, opacity)
      })
    }
  }

  onDestroy() {
    if (this._isInit) {
      this.disposeRenderer()
    }

    this.scene = null
    this.camera = null

    super.onDestroy()
  }
}
