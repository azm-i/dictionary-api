<?php

/*-------------------------------------------------

	--> カスタム投稿タイプ

-------------------------------------------------*/

function template_add_type($text, $context, $catContext, $catText, $tagContext, $tagText)
{
  $labels = array(
    'name' => _x($text, $context),
    'singular_name' => _x($text, $context),
    'add_new' => _x('新しく' . $text . 'を追加', $context),
    'add_new_item' => __($text . 'を追加'),
    'edit_item' => __($text . 'を編集'),
    'new_item' => __($text),
    'view_item' => __($text . 'を見る'),
    'search_items' => __($text . 'を探す'),
    'not_found' =>  __($text . 'はありません'),
    'not_found_in_trash' => __('ゴミ箱に' . $text . 'はありません'),
    'parent_item_colon' => ''
  );

  $args = array(
    'labels' => $labels,
    'public' => true,
    'publicly_queryable' => true,
    // 'show_ui' => true,
    // 'show_in_menu' => true,
    'query_var' => true,
    'rewrite' => true,
    'capability_type' => 'post',
    // 'menu_position' => 5, // メニュー順序はmenu.phpのmy_custom_menu_orderで定義
    'supports'  => array('title', 'editor', 'revisions', 'thumbnail', 'page-attributes'),
    'has_archive' => false,
    'hierarchical' => true,
    'show_in_rest' => true,
    'rest_base' => $context,
  );

  register_post_type($context, $args);

  $catLabels = array(
    'label' => $catText,
    'labels' => array(
      'name' => $catText,
      'singular_name' => $catText,
      'search_items' => '' . $catText . 'を検索',
      'popular_items' => 'よく使われている' . $catText . '',
      'all_items' => 'すべての' . $catText . '',
      'parent_item' => '親' . $catText . '',
      'edit_item' => '' . $catText . 'の編集',
      'update_item' => '更新',
      'add_new_item' => '新規' . $catText . 'を追加',
      'new_item_name' => '新しい' . $catText . '',
    ),
    'public' => true,
    'show_ui' => true,
    'hierarchical' => true,
    'show_tagcloud' => true,
    'show_in_rest' => true,
    'rewrite' => true
  );
  if ($catContext) register_taxonomy($catContext, $context, $catLabels);

  $tagLabels = array(
    'hierarchical' => false,
    'update_count_callback' => '_update_post_term_count',
    'label' => $tagText,
    'public' => true,
    'show_ui' => true
  );

  if ($tagContext) register_taxonomy($tagContext, $context, $tagLabels);
}

function add_type_custom()
{
  template_add_type('Products', 'products', 'products_tag', 'タグ', null, null);
  template_add_type('News', 'news', 'news_tag', 'ジャンルタグ', null, null);
  template_add_type('Store / POP-UP Store', 'store', 'store_category', 'カテゴリ', null, null);
  template_add_type('Line up', 'lineup', 'lineup_category', 'カテゴリ', null, null);
  template_add_type('Faq', 'faq', 'faq_category', 'カテゴリ', null, null);
  template_add_type('Faq注意事項', 'faq_note', null, null, null, null);
}

add_action('init', 'add_type_custom');
