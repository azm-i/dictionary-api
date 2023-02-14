# JS

## 言語

[ES2015](https://babeljs.io/docs/en/learn)

## 構成

### `src/www/assets/js/`

実際に HTML から読み込まれる JS ファイルを配置するディレクトリ。

- `main.js`: 全ページ共通で読み込まれる JS。
- `index.js`: トップページのみで読み込まれる JS。

その他、各ページで読み込む JS もこのディレクトリに配置し、ファイル名はページ名（Pug ファイル名）と一致させる。  
ページが `lower-directory/page.pug` のように下層ディレクトリに存在する場合は、JS ファイル名は `lower-directory-page.js` のようにハイフン `-` でつなげる。

### `src/modules/js/`

各 JS ファイルからインポートするモジュール JS ファイルを配置するディレクトリ。

- `components/`: 汎用コンポーネント
- `core/`: `main.js` で最初に実行する処理
- `events/`: グローバルな各種イベントハンドラーを管理する
- `glsl/`: GLSL ファイル。glslify を導入しているので、JS ファイルからインポートできる。
- `highway/`: Highway ライブラリの Transition 定義
- `managers/`: コンポーネント外で処理するもの
- `pages/`: 各ページの JS からインポートするページ固有のモジュール  
  ページごとにディレクトリを分ける。
- `parentClass/`: 継承することでいろんな処理を自動化できる便利スーパークラス
- `utils/`: 便利関数群
- `vendors/`: 外部ライブラリの ES モジュール（`npm i`したものではなく直接読み込みたいライブラリ）

## ファイルパス

`import` 文でファイルパスを指定する場合、 `~/components/...` や `~/pages/...` ように `~/` で始まる形式にする。<br>
`~/` は `src/modules/js/` のエイリアス。<br>
<small>※ファイルを移動して階層が変わってもパスを変更しなくてすむように、相対パスは使わない。</small>

## 命名規則

基本的に、複数単語のときは後ろに行くほど詳細な単語にしている。[参考](https://v3.ja.vuejs.org/style-guide/#%E3%82%B3%E3%83%B3%E3%83%9B%E3%82%9A%E3%83%BC%E3%83%8D%E3%83%B3%E3%83%88%E5%90%8D%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8B%E5%8D%98%E8%AA%9E%E3%81%AE%E9%A0%86%E7%95%AA-%E5%BC%B7%E3%81%8F%E6%8E%A8%E5%A5%A8)

### ファイル名

- `.js` ファイル: キャメルケース (`camelCase`)

### 変数・関数名

- 通常: キャメルケース (`camelCase`)
- 定数: すべて大文字のスネークケース (`SNAKE_CASE`)
- class: パスカルケース (`PascalCase`)
- プライベート: `_` から始まるキャメルケース (`_camelCase`)

## スーパークラス

- `Component`: コンポーネントなど、基本的にすべてのクラスで有用な機能軍。詳細は[Component 章](#Component)を参照。
- `Page`: 各ページ固有の JS はこれを継承する。[Page 章](#Page)参照。
- `ThreeRenderer`: three.js を使った WebGL 用クラス。
- `ThreeMesh`: three.js Mesh の Geometry や Material の dispose 処理を自動で行うクラス。

### `Component`

`Component` クラスを継承したクラスでは、以下の特定のメソッドを追加すると自動でイベントハンドラーが発火するようになる。

#### イベントハンドラー

- `onResetSize`: [詳細](./event.md#ウィンドウ)
- `onResize`: リサイズイベント。[詳細](./event.md#ウィンドウ)
- `onResizeAlways`: [詳細](./event.md#ウィンドウ)
- `onOrientationchange`: [詳細](./event.md#ウィンドウ)
- `onTick`: `requestAnimationFrame` ループ。[詳細](./event.md#requestAnimationFrame)
  - `constructor` の第 2 引数（`Page` クラスでは第 1 引数）のオプションオブジェクトのプロパティ `isAutoPlayTick` を `true` にすると、最初から `onTick` が自動で実行されるようになる。 `false` の場合は `playTick` を実行しない限りは `onTick` が実行されない。
- `onScroll`: スクロール
- `onCall`: [Locomotive Scroll の call](https://github.com/locomotivemtl/locomotive-scroll#instance-events)
- `onClick`: コンポーネントルート要素をクリックしたとき
- `onMouseenter`: コンポーネントルート要素が対象（タッチイベントのときは発火しない）
- `onMousemove`: コンポーネントルート要素が対象（タッチイベントのときは発火しない）
- `onMouseleave`: コンポーネントルート要素が対象（タッチイベントのときは発火しない）
- `onMousedownDocument`: `document.addEventListener('mousedown')` のイベントハンドラー
- `onMousemoveDocument`: `document.addEventListener('mousemove')` のイベントハンドラー
- `onMouseupDocument`: `document.addEventListener('mouseup')` のイベントハンドラー
- `onLeave`: 非同期遷移のページ離脱時
- `onEnter`: 非同期遷移の次のページ表示時
- `onEnterCompleted`: 非同期遷移の次のページ表示アニメーションが完了した後
- `onLeaveCancelled`: 非同期遷移のページ離脱がキャンセルされたとき
- `onEnterCancelled`: 非同期遷移の次のページ表示がキャンセルされたとき
- `onDestroy`: 非同期遷移有効時にページ遷移で離脱するときに実行される。<br>
  上記メソッドのイベントリスナーはすべて自動で削除されるので、手動削除は不要。<br>
  **※このメソッドを追加したときは必ず関数内の最後で `super.onDestroy()` を実行すること**

#### その他

- `emitResize`: そのクラスの `onResetSize`, `resize`, `onResizeAlways` を強制的に実行する
- `pauseTick`: そのクラスの `onTick` の実行を止める
- `playTick`: そのクラスの `onTick` の実行を再開する
- `isSp`: 現在のウィンドウ幅が SP サイズかどうか
- `isTb`: 現在のウィンドウ幅がタブレットサイズかどうか
- `isTbPortrait`: 現在の表示がタブレット縦向きかどうか
- `scrollTo`: 指定位置にスクロールさせる
- `updateSmoothScroll`: スムーススクロール処理のリサイズ

#### 実装例

```js
import Component from '~/parentClass/Component'

class Button extends Component {
  static selectorRoot = '[data-button]'

  constructor(option) {
    super(option)

    const {
      el, // `selectorRoot` で取得したコンポーネントのルート要素
    } = option

    // 初期化処理
  }

  onTick(time, count, rateFps) {}

  onClick(event) {}

  onMouseenter(event) {}

  onMousemove(event) {}

  onMouseleave(event) {}

  onMousedownDocument(event) {}

  onMousemoveDocument(event) {}

  onMouseupDocument(event) {}

  onScroll(y, obj) {}

  onCall(value, way, obj) {}

  onResetSize(isForce) {}

  onResize(isForce) {}

  onResizeAlways(isForce) {}

  onOrientationchange(isHorizontal) {}

  onLeave() {}

  onEnter() {}

  onEnterCompleted() {}

  onLeaveCancelled() {}

  onEnterCancelled() {}

  onDestroy() {
    super.onDestroy()
  }
}
```

### `Page`

`Component` の機能に加え、以下の初期化タイミングに発火するメソッドを定義。

- `onInit`: main.js の `init` が実行された**後**に処理したいもの。通常はこちらに記述。
- `onMount`: main.js の `init` が実行される**前**に処理したいもの。

<details>
  <summary>実装例</summary>

```js
import Page from '~/parentClass/Page'

class PageCurrent extends Page {
  constructor() {
    super({
      isAutoPlayTick: true,
    })
  }

  onMount() {}

  onInit() {
    // そのページでのメイン処理
  }

  onTick(time, count, rateFps) {}

  onClick(event) {}

  onMouseenter(event) {}

  onMousemove(event) {}

  onMouseleave(event) {}

  onMousedownDocument(event) {}

  onMousemoveDocument(event) {}

  onMouseupDocument(event) {}

  onScroll(y, obj) {}

  onCall(value, way, obj) {}

  onResetSize(isForce) {}

  onResize(isForce) {}

  onResizeAlways(isForce) {}

  onOrientationchange(isHorizontal) {}

  onLeave() {}

  onEnter() {}

  onEnterCompleted() {}

  onLeaveCancelled() {}

  onEnterCancelled() {}

  onDestroy() {
    super.onDestroy()
  }
}
```

</details>

## グローバルイベント

[詳細](./event.md)

## Babel

[`@babel/preset-env`](https://github.com/babel/babel/tree/master/packages/babel-preset-env) によって、一部のモダンな構文やメソッドがレガシーブラウザでも動作するように自動変換される。

## ポリフィル

IE 等レガシーブラウザでサポート対象外のメソッド等を使う場合は、 `src/modules/pug/config.pug` 内の `POLYFILLS` 変数の配列に、[polyfill.io](https://polyfill.io/v3/url-builder/)で使用可能なポリフィルの文字列を追加する。<br>
以下のポリフィルは、Locomotive Scroll と Highway ライブラリなどで必要。

- `Object.assign`
- `Element.prototype.append`
- `NodeList.prototype.forEach`
- `CustomEvent`
- `smoothscroll`
- `fetch`
- `Promise`
- `Element.prototype.prepend`
- `DocumentFragment.prototype.append`

## ライブラリ

外部ライブラリを使いたいときは、基本的に `npm i` でインストールしたものを読み込む。

## 演出

### スムーススクロール

`config/param.js` で `enableSmoothScroll: true` にすると、自動でスムーススクロールが有効になる。

[Locomotive Scroll](https://github.com/locomotivemtl/locomotive-scroll) ライブラリを使用。

#### パララックス

**※ `config/param.js` で `enableSmoothScroll: true` にしてる場合のみ有効。**

Locomotive Scroll の機能で、以下のような属性を追加するだけでパララックスするようになる。

`data-scroll data-scroll-speed="2"`

### 非同期遷移

`config/param.js` で `enableEventAsynchronousTransition: true` にすると、自動で非同期遷移が有効になる。

[Highway](https://highway.js.org/) ライブラリを使用。

## リンター

[JavaScript Standard Style](https://standardjs.com/)
