import Component from '~/parentClass/Component'

export default class ThreeMesh extends Component {
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

  onDestroy() {
    this.disposeGeometry(this.geometry)
    this.disposeMaterial(this.material)

    super.onDestroy()
  }
}
