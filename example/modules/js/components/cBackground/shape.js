import * as THREE from 'three'
import gsapK from '~/utils/gsapK'
import store from '~/managers/store'
import parameters from '~/managers/parameters'
import {
  convertObjectThreeUniforms,
  convertUniformsNoValue,
} from '~/utils/three'
import datGui from '~/utils/datGui'
import ThreeMesh from '~/parentClass/ThreeMesh'
import vertexShader from '~/glsl/template/threePlainBuffer.vert'
import fragmentShader from '~/glsl/cBackground/shape.frag'

//
// パラメーター
//

const datasetParameter = {
  folders: [
    {
      name: '背景',
      parameters: [
        {
          name: 'スピード',
          key: 'pSpeed',
          value: 1,
          range: [0, 10],
        },
        {
          name: '色',
          key: 'pColor',
          value: '#00C58E',
        },
      ],
    },
  ],
}

//
// main
//

export default class Shape extends ThreeMesh {
  static isPermanent = true
  uniformsNoValue
  mesh

  init() {
    const pageIndex = this.detectPageIndex()

    const geometry = new THREE.PlaneBufferGeometry()

    const uniformsObject = {
      uResolution: new THREE.Vector2(),
      uTime: 0,
      uPageIndexPrev: pageIndex,
      uPageIndexNext: pageIndex,
      uProgressTransition: 0,
    }
    const uniforms = convertObjectThreeUniforms(uniformsObject)
    this.uniformsNoValue = convertUniformsNoValue(uniforms)
    const uniformsParameter = datGui.convertDatasetUniform(datasetParameter)

    const material = new THREE.RawShaderMaterial({
      uniforms: { ...uniforms, ...uniformsParameter },
      vertexShader,
      fragmentShader,
      transparent: true,
    })

    this.mesh = new THREE.Mesh(geometry, material)
  }

  detectPageIndex(pageName = store.pageId) {
    switch (pageName) {
      case 'pAbout':
        return 1
      case 'pIndex':
      default:
        return 0
    }
  }

  enter(pageId, pageIdPrev) {
    gsapK.fromTo(
      this.uniformsNoValue,
      {
        uPageIndexPrev: this.detectPageIndex(pageIdPrev),
        uPageIndexNext: this.detectPageIndex(pageId),
        uProgressTransition: 0,
      },
      {
        uProgressTransition: 1,
        duration: parameters.durationPageOut + parameters.durationPageIn,
        ease: parameters.easePage,
      }
    )
  }

  tick(time) {
    this.uniformsNoValue.uTime = time
  }

  resize(width, height) {
    this.uniformsNoValue.uResolution.set(width, height)

    this.mesh.scale.set(width, height, 1)
  }
}
