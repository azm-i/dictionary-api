# CSS

## 言語

[Sass (SCSS)](https://sass-lang.com/)

## 基本

- 状況に応じてブロック単位でファイルを分ける

## 命名規則

独自ルールに従う。[詳細](./rule.md)

## ファイルパス

`import` 文でファイルパスを指定する場合、 `~/components/...` や `~/pages/...` ように `~/` で始まる形式にする。（`~` は `src/modules/css` ディレクトリを指す）<br>
<small>※ファイルを移動して階層が変わってもパスを変更しなくてすむように、相対パスは使わない。</small>

## Sass 変数・ミックスイン

実際に出力される CSS ファイル（`src/www/assets/css`配下の SCSS ファイル）には、以下の import 文を書き、すべての変数・ミックスインを使えるようにする。

```scss
@import '~/abstracts/**/*.scss';

.cExample {
  color: $color-theme;
}
```

## デバイス別スタイル

デバイス別のスタイルは、mixin を使い同じスコープ内に書く。<br>
modules 以外の mixin が必要であれば適宜追加する。

```scss
.cExample {
  // 共通
  @include media-pc {
    // PC
  }
  @include media-tb {
    // タブレット
  }
  @include media-sp {
    // SP
  }

  &-child {
    // 共通
    @include media-pc {
      // PC
    }
    @include media-tb {
      // タブレット
    }
    @include media-sp {
      // SP
    }
  }
}
```

## 可変サイズ

ウィンドウ幅によって拡縮するサイズを指定するときは、 `size-variable-pc`, `size-variable-sp` の関数を使用する。  
引数の値はデザインカンプと同じサイズの px 値。px の単位を付けても付けなくてもよい。

可変のフォントサイズを指定する場合は `font-size-variable-pc`, `font-size-variable-sp` の mixin を使用する。  
この mixin を使うと、10px 以下、または引数で指定した px 数以下となるウィンドウ幅以下になったときに、それ以上小さくならないようなスタイルが自動的に追加される。

どちらも、SP のほうはデザインカンプと同じ、ブラウザ上の表示の 2 倍サイズで指定する。

基準のウィンドウ幅は `src/modules/css/abstracts/size.scss` 内の `$base-width-pc`, `$base-width-sp` の値となる。この値とデザインカンプの幅を合わせる。

```scss
@include media-pc {
  @include font-size-variable-pc(16);
  width: size-variable-pc(200);
}
@include media-sp {
  @include font-size-variable-sp(30); // ブラウザ上では 15px
  width: size-variable-sp(200); // ブラウザ上では 100px
}
```

## トラッキング

PSD のトラッキング値は、以下の mixin で反映できる。

```scss
@include tracking(50);
```

以下のように Zeplin の値を size-variable で指定する形式も可。<br>
ただし、この形式の場合は SP の指定も必要になる。

```scss
@include media-pc {
  letter-spacing: size-variable-pc(3.6px);
}
@include media-sp {
  letter-spacing: size-variable-sp(3.6px);
}
```

## リンター

[stylelint-config-standard-scss](https://github.com/moeriki/stylelint-config-standard-scss#readme)
