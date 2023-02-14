import * as THREE from 'three'

// デフォルトでキャッシュを有効にする
THREE.Cache.enabled = true

let textureLoader
let objectLoader
let fontLoader

export function loadTexture(url, onLoad) {
  textureLoader = textureLoader || new THREE.TextureLoader()

  return url
    ? textureLoader.load(url, (texture) => {
        if (onLoad) onLoad(texture)
      })
    : null
}

export function loadTextureOptimize(url, onLoad) {
  return /\.png$/.test(url)
    ? loadTextureOptimizePng(url, onLoad)
    : /\.jpe?g$/.test(url)
    ? loadTextureOptimizeJpg(url, onLoad)
    : null
}

export function loadTextureOptimizePng(url, onLoad) {
  textureLoader = textureLoader || new THREE.TextureLoader()

  return url
    ? textureLoader.load(url, (texture) => {
        optimizePngJaggy(texture)
        if (onLoad) onLoad(texture)
      })
    : null
}

export function loadTextureOptimizeJpg(url, onLoad) {
  textureLoader = textureLoader || new THREE.TextureLoader()

  return url
    ? textureLoader.load(url, (texture) => {
        optimizeJpg(texture)
        if (onLoad) onLoad(texture)
      })
    : null
}

export function loadTextureSync(url) {
  textureLoader = textureLoader || new THREE.TextureLoader()

  return url
    ? new Promise((resolve) => {
        textureLoader.load(url, resolve)
      })
    : Promise.resolve(null)
}

export function loadTextureOptimizeSync(url) {
  return /\.png$/.test(url)
    ? loadTextureOptimizePngSync(url)
    : /\.jpe?g$/.test(url)
    ? loadTextureOptimizeJpgSync(url)
    : Promise.resolve(null)
}

export function loadTextureOptimizePngSync(url) {
  textureLoader = textureLoader || new THREE.TextureLoader()

  return url
    ? new Promise((resolve) => {
        textureLoader.load(url, (texture) => {
          optimizePngJaggy(texture)
          resolve(texture)
        })
      })
    : Promise.resolve(null)
}

export function loadTextureOptimizeJpgSync(url) {
  textureLoader = textureLoader || new THREE.TextureLoader()

  return url
    ? new Promise((resolve) => {
        textureLoader.load(url, (texture) => {
          optimizeJpg(texture)
          resolve(texture)
        })
      })
    : Promise.resolve(null)
}

export function loadJSONSync(url) {
  objectLoader = objectLoader || new THREE.ObjectLoader()

  return url
    ? new Promise((resolve) => {
        objectLoader.load(url, resolve)
      })
    : Promise.resolve(null)
}

export function loadFontSync(url, text) {
  fontLoader = fontLoader || new THREE.FontLoader()

  return url
    ? new Promise((resolve, reject) => {
        fontLoader.load(
          url,
          (font) => {
            const geometry = new THREE.TextGeometry(text, {
              font,
              size: 60 / (text.length / 4),
              height: 20,
              curveSegments: 12,
              bevelEnabled: true,
              bevelThickness: 1,
              bevelSize: 1,
              bevelSegments: 5,
            })
            resolve(geometry)
          },
          () => {},
          reject
        )
      })
    : Promise.resolve(null)
}

/**
 * Texture(透過PNG)の境界線のジャギを消す
 * @param {Texture} texture
 */
export function optimizePngJaggy(texture, filter = THREE.LinearFilter) {
  texture.anisotropy = 0
  texture.magFilter = texture.minFilter = filter
}

/**
 * Texture(JPEG)の最適化
 * @param {Texture} texture
 */
export function optimizeJpg(texture, filter = THREE.LinearFilter) {
  texture.magFilter = texture.minFilter = filter
}

/**
 * value キーのある three.js 用の uniforms オブジェクトに変換（そのオブジェクトの値を更新すると元のオブジェクトの同キーの value キーの値が更新される）
 * @param {Object} uniforms value キーなしの uniforms オブジェクト
 * @return {Object} value キーのある three.js 用の uniforms オブジェクト
 */
export function convertObjectThreeUniforms(uniforms) {
  const newUniforms = {}
  Object.keys(uniforms).forEach((key) => {
    newUniforms[key] = { value: uniforms[key] }
  })
  return newUniforms
}

/**
 * value キーのない uniforms オブジェクトに変換（そのオブジェクトの値を更新すると元のオブジェクトの同キーの value キーの値が更新される）
 * @param {Object} uniforms three.js 用の value キーありの uniforms オブジェクト
 * @return {Object} value キーのない更新用 uniforms オブジェクト
 */
export function convertUniformsNoValue(uniforms) {
  const newUniforms = {}
  Object.keys(uniforms).forEach((key) => {
    Object.defineProperty(newUniforms, key, {
      get() {
        return uniforms[key].value
      },
      set(value) {
        uniforms[key].value = value
      },
    })
  })
  return newUniforms
}
