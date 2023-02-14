<?php

/*-------------------------------------------------

	--> // ACFのオプション設定をちゃんと反映させる（ボックス配置データを削除する）

-------------------------------------------------*/

function clear_meta_box_order()
{
  // 通常の投稿ページの編集画面
  delete_user_meta(wp_get_current_user()->ID, 'meta-box-order_post');
  // 固定ページの編集画面
  delete_user_meta(wp_get_current_user()->ID, 'meta-box-order_page');
}
add_action('admin_init', 'clear_meta_box_order');

/*-------------------------------------------------

	--> // ACFの特定のwysiwygで特定の機能のみ有効化

-------------------------------------------------*/
function my_acf_toolbars($toolbars)
{
  $toolbars['Simple'] = array();
  $toolbars['Simple'][1] = array('bold', 'bullist', 'link', 'unlink');

  return $toolbars;
}
add_filter('acf/fields/wysiwyg/toolbars', 'my_acf_toolbars');

/*-------------------------------------------------

	--> // REST APIのリビジョンにACFデータを追加する
  https://github.com/airesvsg/acf-to-rest-api/issues/190#issuecomment-345854148

-------------------------------------------------*/
add_filter('rest_prepare_revision', function ($response, $post) {
  $data = $response->get_data();

  $data['acf'] = get_fields($post->ID);

  return rest_ensure_response($data);
}, 10, 2);
