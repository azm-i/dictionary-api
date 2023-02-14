<?php

/*-------------------------------------------------

	--> カスタム投稿並びおかしいバグ

-------------------------------------------------*/

// 有効にするには23行目のコメントアウトを削除して、postTypeNAMEを任意のものに変更下さい

function custom_post_sort($query)
{
 if (!$query->is_main_query())
  return;
 elseif (is_admin()) {
  if (isset($query->query_vars['post_type'])) {
   if (
    $query->query_vars['post_type'] == 'news'
   ) {
    $query->set('orderby', 'date');
    $query->set('order', 'DESC');
   }
  }
 }
}
add_action('pre_get_posts', 'custom_post_sort');
