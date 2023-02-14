<?php

/*-------------------------------------------------

	--> // ページ属性「順序」非表示
  --> // ACFのplaceholderの色を変更

-------------------------------------------------*/

function custom_admin_style()
{
?>
 <style>
  .post-attributes-label[for='menu_order'],
  #menu_order {
   display: none !important;
  }

  .acf-field input[type="text"]::placeholder,
  .acf-field textarea::placeholder {
   opacity: 0.5 !important;
  }
 </style>
<?php
}
add_action('admin_head', 'custom_admin_style');

/*-------------------------------------------------

	--> // 投稿エディタの初期値をビジュアルからテキストに変更

-------------------------------------------------*/

function disable_visual_editor_in_page()
{
 global $typenow;
 if ($typenow == 'page') {
  add_filter('user_can_richedit', 'disable_visual_editor_filter');
 }
}
function disable_visual_editor_filter()
{
 return false;
}
// add_action('load-post.php', 'disable_visual_editor_in_page');
// add_action('load-post-new.php', 'disable_visual_editor_in_page');
