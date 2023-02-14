<?php

/*-------------------------------------------------

	--> 管理画面一覧 カスタマイズ

-------------------------------------------------*/

function add_custom_widget()
{

 $lists = [
  ['総合TOP', '/', '総合TOPページを変更できます。<br>記事は削除しないで下さい', '/cms/wp-admin/post.php?post=2&action=edit', '総合TOPページ編集', false, false],
  ['PRESS BUTTER SAND', '/pbs/', 'PRESS BUTTER SANDページの注記を変更できます。<br>記事は削除しないで下さい', '/cms/wp-admin/post.php?post=89&action=edit', 'PRESS BUTTER SANDページ編集', false, false],
  ['ギャラリー', '/gallery/', 'ギャラリーページを変更できます。<br>記事は削除しないで下さい', '/cms/wp-admin/post.php?post=91&action=edit', 'ギャラリーページ編集', false, false],
  ['Products', '/products/', '記事一覧画面にてドラッグアンドドロップにて並替え可能です', '/cms/wp-admin/edit.php?post_type=products', 'Products一覧', '/cms/wp-admin/edit-tags.php?taxonomy=products_tag&post_type=products', 'Productsタグ編集'],
  ['News', '/news/', '記事は公開日順に並びます', '/cms/wp-admin/edit.php?post_type=news', 'News一覧', '/cms/wp-admin/edit-tags.php?taxonomy=news_tag&post_type=news', 'Newsタグ編集'],
  ['Store / POP-UP Store', '/store/', '記事一覧画面にてドラッグアンドドロップにて並替え可能です', '/cms/wp-admin/edit.php?post_type=store', 'Store一覧', '/cms/wp-admin/edit-tags.php?taxonomy=store_category&post_type=store', 'Storeカテゴリ編集'],
  ['Line up', false, '記事は公開日順に並びます<br>サイト上に公開はされません', '/cms/wp-admin/edit.php?post_type=lineup', 'Line up一覧', '/cms/wp-admin/edit-tags.php?taxonomy=lineup_category&post_type=lineup', 'Line upカテゴリ編集'],
  ['Faq', '/faq/', '記事一覧画面にてドラッグアンドドロップにて並替え可能です', '/cms/wp-admin/edit.php?post_type=faq', 'Faq一覧', '/cms/wp-admin/edit-tags.php?taxonomy=faq_category&post_type=faq', 'Faqカテゴリ編集'],
  ['Faq注記', '/faq/', 'Faqページの注記を変更できます。<br>記事は削除しないで下さい', '/cms/wp-admin/post.php?post=183&action=edit', 'Faq注記編集', false, false],
 ];

 echo '<div class="wrap">';
 echo '<div class="index_wrap">';

 foreach ($lists as $list) {
  echo '<div class="index_list">';
  foreach ($list as $key => $val) {
   if ($key === 4 || !$val) continue;
   if ($key === 0) {
    echo '<h1 class="index_title">';
    echo $val;
    echo '</h1>';
   } else if ($key === 1) {
    echo '<div class="index_link">';
    echo '【URL】<a href="' . $val . '" target="_blank">' . $val . '</a>';
    echo '</div>';
   } else if ($key === 2) {
    echo '<p class="index_text">';
    echo $val;
    echo '</p>';
   } else if ($key === 3) {
    echo '<div class="index_button"><a href="' . $val . '" class="button button-primary">' . $list[4] . '</a></div>';
   } else if ($key === 5) {
    echo '<div class="index_button"><a href="' . $val . '" class="button button-primary">' . $list[6] . '</a></div>';
   }
  }
  echo '</div>';
 }

 echo '</div>';
 echo '</div>';
}

function add_my_widget()
{
 wp_add_dashboard_widget('custom_widget', '管理画面INDEX', 'add_custom_widget');
}

add_action('wp_dashboard_setup', 'add_my_widget');

function custom_dashboard_style()
{
?>
 <style>
  #wpbody-content #dashboard-widgets .postbox-container,
  #wpbody-content #dashboard-widgets #postbox-container-1 {
   width: 99.9%;
  }

  .index_wrap {
   margin-top: -20px;
  }

  .index_list {
   border: 1px solid #c3c4c7;
   box-sizing: border-box;
   margin-top: 20px;
  }

  .index_button {
   margin-top: 10px;
  }

  @media only screen and (min-width: 800px) {

   .index_wrap {
    display: flex;
    flex-wrap: wrap;
   }

   .index_list {
    width: 49%;
    padding: 1% 2% 3% 2%;
   }

   .index_list:nth-child(even) {
    margin-left: 2%;
   }
  }

  @media only screen and (min-width: 1200px) {

   .index_list {
    width: 32%;
   }

   .index_list:nth-child(even) {
    margin-left: 0;
   }

   .index_list:nth-child(n) {
    margin-left: 2%;
   }

   .index_list:nth-child(3n + 1) {
    margin-left: 0;
   }
  }
 </style>
<?php
}
add_action('admin_head', 'custom_dashboard_style');

//ダッシュボードにある項目を消す
function remove_dashboard_widget()
{
 remove_meta_box('dashboard_site_health', 'dashboard', 'normal'); //サイトヘルスステータス
 remove_meta_box('dashboard_right_now', 'dashboard', 'normal'); //概要
 remove_meta_box('dashboard_activity', 'dashboard', 'normal'); //アクティビティ
 remove_meta_box('dashboard_quick_press', 'dashboard', 'side'); //クイックドラフト
 remove_meta_box('dashboard_primary', 'dashboard', 'side'); //WordPressニュース
 remove_action('welcome_panel', 'wp_welcome_panel'); //ようこそ
}
add_action('wp_dashboard_setup', 'remove_dashboard_widget');
