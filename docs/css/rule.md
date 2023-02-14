# CSS 命名規則

[rscss](https://rscss.io/) をベースとしてカスタマイズしたルールにしている。

## Components

BEM で言う block

### クラス名

- キャメルケース
- 必ず以下の 1 文字のプレフィックスをつける。<br>
  以下の文字以外の 1 文字は使わない。
  - `p` (page): ページ自体（各ページに 1 つのみ）
  - `l` (local): ページ固有のコンポーネント（他のページでは使わない）
  - `c` (common): 全ページ共通の汎用コンポーネント

```scss
.pIndex {
  /* ✅ OK */
}

.cSearchForm {
  /* ✅ OK */
}

.search-form {
  /* ❌ 禁止（1文字プレフィックスがない、キャメルケースでない） */
}

.sForm {
  /* ❌ 禁止（sはルールにない） */
}
```

## Elements

BEM で言う element

### クラス名

- プレフィックスに Components と同じ名前＋ハイフン `-` をつける
- ハイフンは必ず 1 つにする
- 複数単語をつなぐ場合はキャメルケース。

```scss
.cProfileBox {
  &-avatar {
    /* ✅ OK */
  }
  &-firstName {
    /* ✅ OK */
  }
  &-list-item {
    /* ❌ 禁止 */
  }
  &-listItem {
    /* ✅ OK */
  }
  .text {
    /* ❌ 禁止（ComponentsでもElementsでもない） */
  }
}
```

## Variants

BEM で言う modifier

### クラス名

- プレフィックスとしてハイフン（`-`）をつける。
- 複数単語をつなぐ場合はキャメルケース。
- 必ず Components または Elements とセットで使い、単独では使わない。

```scss
.cLikeButton {
  &.-disabled {
    /* ✅ OK */
  }
  &.-sizeLarge {
    /* ✅ OK */
  }
  &-text.-small {
    /* ✅ OK */
  }
  .-small {
    /* ❌ 禁止（Components または Elements とセットで使っていない） */
  }
}
```

## Helpers

コンポーネントとは関係ない汎用クラス

### クラス名

- プレフィックスとしてアンダースコア（`_`）をつける。

### その他

- 定義、使用は必要最小限に抑える。
- Helpers クラスでのみ `!important` を使用可能だが、極力使わないようにする。

```scss
// PCレイアウトでのみ表示
._pc {
  @include media-sp {
    display: none !important;
  }
}

// SPレイアウトでのみ表示
._sp {
  @include media-pc {
    display: none !important;
  }
}
```
