<?php

/*-------------------------------------------------

	--> 管理画面カスタム投稿タイプ一覧 カスタマイズ

-------------------------------------------------*/

// products
function add_custom_column_products($defaults)
{
  $defaults['name_jp'] = '日本語名'; //項目名
  return $defaults;
}
add_filter('manage_products_posts_columns', 'add_custom_column_products');

function add_custom_column_id_products($column_name, $id)
{
  if ($column_name == 'name_jp') {
    $name_jp = get_field('name_jp', $id);
    echo $name_jp;
  }
}
add_action('manage_products_posts_custom_column', 'add_custom_column_id_products', 10, 2);

// store
function add_custom_column_store($defaults)
{
  $defaults['area'] = '地域'; //項目名
  return $defaults;
}
add_filter('manage_store_posts_columns', 'add_custom_column_store');

function add_custom_column_id_store($column_name, $id)
{
  if ($column_name == 'area') {
    $area = get_field('area', $id);
    if (isset($area['label'])) {
      echo $area['label'];
    }
  }
}
add_action('manage_store_posts_custom_column', 'add_custom_column_id_store', 10, 2);


function posts_sortable_columns($sortable_column)
{
  $sortable_column['area'] = 'area';
  return $sortable_column;
}
// add_filter('manage_edit-store_sortable_columns', 'posts_sortable_columns');

function posts_columns_sort_param($vars)
{
  if (isset($vars['orderby']) && 'area' === $vars['orderby']) {
    $vars = array_merge(
      $vars,
      array(
        'meta_key' => 'area',
        'orderby' => 'meta_value',
      )
    );
  }
  return $vars;
}
// add_filter('request', 'posts_columns_sort_param');
