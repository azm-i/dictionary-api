<?php

/*-------------------------------------------------

	--> // サイドメニューの固定ページ項目追加

-------------------------------------------------*/

function add_page_to_admin_menu()
{
 add_menu_page('総合TOP', '総合TOP', 'edit_pages', 'post.php?post=2&action=edit', '', 'dashicons-admin-page');
 add_menu_page('PRESS BUTTER SAND', 'PRESS BUTTER SAND', 'edit_pages', 'post.php?post=89&action=edit', '', 'dashicons-admin-page');
 add_menu_page('ギャラリー', 'ギャラリー', 'edit_pages', 'post.php?post=91&action=edit', '', 'dashicons-admin-page');
}
add_action('admin_menu', 'add_page_to_admin_menu');

/*-------------------------------------------------

	--> // サイドメニューの項目削除

-------------------------------------------------*/

function remove_menus()
{
 // すべてのユーザー
 remove_menu_page('edit.php'); //投稿
 remove_menu_page('edit-comments.php'); //コメント

 // 管理者以外
 if (!is_super_admin()) {
  // remove_menu_page('index.php'); //ダッシュボード
  remove_menu_page('edit.php?post_type=page'); //固定ページ
  // remove_menu_page('upload.php'); //メディア
  remove_menu_page('themes.php'); //外観
  remove_menu_page('plugins.php'); //プラグイン
  remove_menu_page('tools.php'); //ツール
  remove_menu_page('options-general.php'); //設定
  remove_menu_page('edit.php?post_type=acf-field-group'); //Advanced Custom Fields
 }
}
add_action('admin_menu', 'remove_menus');

/*-------------------------------------------------

	--> // メニューの並び替え

-------------------------------------------------*/

function my_custom_menu_order($menu_order)
{
 if (!$menu_order) return true;
 return array(
  'index.php', //ダッシュボード

  'separator1', //セパレータ1

  'edit.php', //投稿
  // 'edit.php?post_type=custom', //カスタム投稿タイプ: custom
  'edit.php?post_type=page', //固定ページ
  // 'post.php?post=20&action=edit', //個別固定ページ: ページ名

  'post.php?post=2&action=edit', //個別固定ページ: 総合TOP
  'post.php?post=89&action=edit', //個別固定ページ: PRESS BUTTER SAND
  'post.php?post=91&action=edit', //個別固定ページ: ギャラリー
  'edit.php?post_type=products', //カスタム投稿タイプ: products
  'edit.php?post_type=news', //カスタム投稿タイプ: news
  'edit.php?post_type=store', //カスタム投稿タイプ: store
  'edit.php?post_type=lineup', //カスタム投稿タイプ: lineup
  'edit.php?post_type=faq', //カスタム投稿タイプ: faq
  'edit.php?post_type=faq_note', //カスタム投稿タイプ: faq_note

  'separator2', //セパレータ2

  'upload.php', //メディア (一番下に移動しました)
  'edit-comments.php', //コメント

  'separator-last', //最後のセパレータ

  'themes.php', //外観
  'plugins.php', //プラグイン
  'users.php', //ユーザー
  'tools.php', //ツール
  'options-general.php', //設定
 );
}
add_filter('custom_menu_order', 'my_custom_menu_order');
add_filter('menu_order', 'my_custom_menu_order');
