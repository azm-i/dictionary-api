# HTML

## 言語

[Pug](https://pugjs.org/)

## 基本

全ページ共通部分を定義する Pug ファイルは `src/modules/pug/layouts/` 配下にある。

- base.pug: `DOCTYPE`から始まるルートのファイル
- main.pug: ヘッダー・フッター等、全ページ共通部分
- default.pug: 多くのページで共通化する HTML。各ページの Pug では基本これを `extends` する。<br>
  レイアウトパターンを変えるときは default.pug ファイルを複製して別パターン用のファイルを作る。

### 変数

#### base.pug

- `SITE_NAME`: サイトの名前。基本的にトップページのタイトルと同じになる。
- `SITE_OG_IMAGE`: `og:image` のデフォルト値。
- `IS_GA_SEND_PAGE_VIEW_MANUAL`: GA のページビューイベントを手動で実行するかどうか。非同期遷移有効時は自動でページビューイベントが実行されるが、手動で実行したいときは `false` にする。

## コンポーネント

汎用コンポーネントは `src/modules/pug/components/` 配下に mixin を定義したファイルを格納する。  
ここに格納したファイルは `base.pug` ですべて自動で読み込まれる。

ページ固有のコンポーネントやブロック単位で分割ファイルは、 `src/modules/pug/pages` 配下に格納する。  
ここに格納したファイルは自動では読み込まれないので、各ページの Pug で `include` する。

## 画像

基本、Pug ミックスイン `img` を使う。

```pug
+img({ src: '/assets/img/ページ名/pc/example.png', alt: 'altテキスト' })
```

PC 用画像は `/assets/img/ページ名/pc/example.png` 、SP 用画像は `/assets/img/ページ名/sp/example.png`（`ページ名`, `example.png` は任意の名前）のように画像を同じ名前で配置し、<br>
Pug で `+img({ src: '/assets/img/ページ名/pc/example.png' })` のように PC 用画像のパスだけ指定すれば、SP 幅では SP 用の画像に自動で切り替わるようになる。<br>
SP 用画像が存在しなければ、SP でも PC 用画像が表示されます。<br>
<small>※PC/SP 共通のものは `/pc/` の中に入れる必要はない。</small>

- `/assets/img/ページ名/pc/example@2x.png`
- `/assets/img/ページ名/sp/example@2x.png`

さらに、画像アセットで 1x/2x それぞれ出力される場合は、以下のようにディレクトリを分ける。<br>
そして Pug で`+img({ src: '/assets/img/ページ名/pc/1x/*.png' })`のように PC の 1 倍サイズのパスだけ指定すると、ウィンドウ幅や解像度によってそれぞれの画像に自動的に切り替わるようになる。

- `/assets/img/ページ名/pc/1x/example.png`
- `/assets/img/ページ名/pc/2x/example@2x.png`
- `/assets/img/ページ名/sp/1x/example.png`
- `/assets/img/ページ名/sp/2x/example@2x.png`

### WebP

`config/param.js` の `enableWebP` を true にすると、 `src/www/assets/img` 配下に格納した画像ファイル（.png, .jpg）がすべて WebP に自動で変換される。

さらに、 `img` Pug コンポーネントで出力した画像も自動で環境に応じて WebP かそれ以外かを振り分けて表示されるようになる（.webp 拡張子を指定する必要はない）。<br>
`img` のオプション `isWebp` を false にすると、そのタグのみ WebP ではない画像を表示することができる。

```pug
+img({ src: '/assets/img/ページ名/pc/example.png', isWebp: false })
```

## SVG の色変更

アイコンなどの単色の SVG を HTML 上に出力する場合は、Pug ミックスイン `svg` を使う。

`src/modules/svg` 以下に SVG ファイルを置く。 SVG はアウトライン化されたもので、`fill` や `stroke` に色を設定していないものにすること。<small>（デザインと同じ色であれば `fill`, `stroke` はそのままで OK。）</small>

その後、`svg` Pug ミックスインの引数オブジェクトのプロパティ `name` の値に、SVG ファイル名から拡張子を取った文字列（`b-step_01.svg` というファイル名であれば `b-step_01`）を指定することで表示することができる。<br>
引数プロパティ `alt` の値は通常の img タグと同様。（内部では alt の代わりとなる `aria-label` 属性で出力される。省略可能。）

デフォルトで文字と同じ色（`currentColor`）になるが、CSS で `color` または `fill` を指定することで色を変更することができる。

また、引数プロパティ `isSizeFont` を true に設定すると、親要素のテキストのフォントサイズと同じ大きさになる。<small>（※style 属性が付与されるので CSS での上書き不可）</small>

```pug
+svg({ name: 'b-step_01', alt: 'altテキスト' })
```

色を変更する必要がない SVG は、 `img` コンポーネントか `<img>` タグで読み込む。

## デバイス間の切り替え表示

デバイスによって要素の表示・非表示を切り替える場合は、 [`_pc`, `_sp` のヘルパークラス](./css/rule.md#Helpers)を使う。
