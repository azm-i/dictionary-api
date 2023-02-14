# 開発環境について

Pug ベースの静的サイト用テンプレート。

## 推奨バージョン

Node v14 以上

### 動作確認済みバージョン

※メジャーバージョンだけ合っていればよいので、必ずしも下記バージョンにする必要はない。

```sh
$ node -v
v14.17.4
```

```sh
$ npm -v
6.14.14
```

## コマンド一覧

- インストール <small>※初回のみ</small>
  ```sh
  $ npm i
  ```
- ローカル開発
  ```sh
  $ npm run dev
  ```
  - 実装例起動
    ```sh
    $ npm run dev:example
    ```
- テスト・本番環境用ビルド
  ```sh
  $ npm run build
  ```
- WordPress 組み込み用 HTML 差分確認
  ```sh
  $ npm run wp
  ```
- JS & Sass ドキュメント表示
  ```sh
  $ npm run doc
  ```
- リントチェック
  ```sh
  $ npm run lint
  ```
  - 自動修正
    ```sh
    $ npm run lint:fix
    ```

## ディレクトリ構造

- `.dist`: 開発時に生成されるディレクトリ。 **※こちらはサーバーへはアップしない**
- `dist`: ビルド後に生成されるディレクトリ。このディレクトリ以下のファイル一式をサーバーにアップする。
- `docs`: 開発環境に関するドキュメント
- `example`: 実装例のソースコード。 `npm run dev:example` で起動したときに `src/...` ディレクトリの代わりに使用される。中の構造は `src/...` ディレクトリと同じ。
  - `modules`
  - `static`
  - `www`
- `src`: ソースディレクトリ
  - `demo`: 開発用デモページ。 `www` ディレクトリの `.pug` ファイルと同じ形式。ローカル開発時のみ表示され、ビルド時は出力されない。
    - `_parts/index.pug`: サイトで使う汎用パーツを並べた一覧ページ http://localhost:3000/_parts/
    - `_template/index.pug`: テンプレートページ。ページを増やすときはこのファイルをコピーする。 http://localhost:3000/_template/
  - `modules`: SCSS、JS モジュール **※実際には出力されないファイル** `~/...` のパスでインポート可能
    - `css`: SCSS ファイル (`.scss`)
      - `abstracts`: Sass 変数や mixin など、ビルド後 CSS に直接出力されないファイル
      - `components`: コンポーネント用スタイル
      - `foundation`: リセットスタイルやページ大枠のスタイル
      - `vendors`: JS ライブラリのスタイル上書き
    - `js`: 他の JS ファイルから読み込む JS モジュール (`.js`)
      - `components`: コンポーネント定義
      - `core`
        - `events.js`: 全ページ共通で発火させるイベントの定義
        - `polyfill.js`: JS ポリフィルの実行コード
      - `glsl`: シェーダーファイル (`.vert`, `.frag`, `.glsl`)
        - `utils`: glslify で読み込む便利モジュール
      - `managers`: レイアウトに関するものなど、全ページ共通処理モジュール
      - `utils`: 便利モジュール
    - `pug`: 他の Pug ファイルから読み込む Pug モジュール (`.pug`)
    - `svg`: [`svg` コンポーネント](https://github.com/Studio-Details/pug-static-template/blob/master/docs/html.md#svg-%E3%81%AE%E8%89%B2%E5%A4%89%E6%9B%B4)で読み込む（SVG スプライトにする）ファイル (`.svg`)
  - `static`: コンパイルせずにそのまま dist へ移すファイル ※ビルド後に出力されるファイル
  - `www`: サーバーへアップするファイル ※ビルド後に出力されるファイル
    - `assets`: 実際に出力される CSS、JS、画像などのファイル
      - `css`
        - `main.scss`: 全ページで読み込まれる共通スタイル
      - `img`: 画像ファイル
      - `js`
        - `main.js`: 全ページで読み込まれる共通 JS
- `vendors`: [有料版 GSAP](https://greensock.com/) の `.tgz` ファイルなど、直接 npm インストールできないものを置く

## 各種設定ファイル

- `.babelrc.js`: Babel
- `.browserslistrc`: 対象ブラウザ。Autoprefixer などに使われる。
- `.editorconfig`: 各種エディターのインデントなどの設定を統一する。
- `.eslintignore`: リント対象から除外するファイル
- `.eslintrc.js`: JS リントルール
- `.prettierignore`: フォーマット対象から除外するファイル
- `.prettierrc`: コードフォーマットルール
- `jsconfig.json`: VS Code 用の JS 設定。 `~/...` などのパスへの定義ジャンプが有効になる。
- `jsdocrc.json`: JSDoc の設定
- `README.md`: プロジェクトに関するドキュメント
- `stylelint.config.js`: CSS リントルール
- `webpack.config.js`: webpack

## ページ生成

`src/demo/_template/index.pug` を `src/www` ディレクトリにコピーしてページを増やす。

`src/www` 以下のディレクトリ構造とビルド後 (`dist`) の HTML ディレクトリ構造は同じになる。

## コーディング

### 詳細

- [HTML](html.md)
- [CSS](css/README.md)
- [JS](js/README.md)

## ルート相対パス

サイトルートディレクトリがドメインルートではなくサブディレクトリの場合、 `config/site-info.js` ファイルの `rootDir` 変数の値をサブディレクトリのパスに変更する。<br>
そして、ルート相対パスの URL を書くときは、 `getFullPath` 関数を使う（Pug, SCSS, JS それぞれで使用可能）。<br>
引数は `src/www` ディレクトリをルートとするパス。

### 例

`config/site-info.js`

```js
const rootDir = '/example/'
```

の場合、<br>
`getFullPath('/assets/img/')` → `'/example/assets/img/'`

## ポリフィル

### JS のみのポリフィル

[JS のドキュメント内](js/README.md#ポリフィル)を参照。

### IE サポート対象のときに有効になるポリフィル

一部のポリフィルは、 `.browserslistrc` に `IE` が入っていると自動で有効になる。

- SVG の use タグ
- Grid Layout の IE 対応

#### `src/modules/js/core/polyfill.js` 内のコメントアウトを外すと有効になるポリフィル

- object-fit polyfill（postcss-object-fit-images も含む）
- position:sticky

その他追加したいポリフィルがあれば、 `src/modules/js/core/polyfill.js` 内に追記する。

## サーバー

### 実機確認

`npm run dev` でローカルサーバーを起動すると、自動で IP アドレスの URL がブラウザで開くので、
実機確認するときは、ローカルサーバーを起動している端末と同じネットワークに接続してその IP アドレスの URL にアクセスする。

## その他

- [VS Code 拡張機能](vscode.md)
