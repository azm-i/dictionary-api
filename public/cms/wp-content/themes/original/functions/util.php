<?php

/*-------------------------------------------------

	--> テーマ関連

-------------------------------------------------*/

function get_url($path = '', $esc_url = true)
{
  $url = home_url($path);
  return $esc_url ? esc_url($url) : $url;
}
function the_url($path = '', $esc_url = true)
{
  echo get_url($path, $esc_url);
}
function get_asset($path = '')
{
  return esc_url(get_stylesheet_directory_uri() . '/assets/' . $path);
}
function the_asset($path = '')
{
  echo get_asset($path);
}
function remove_wysiwyg()
{
  remove_post_type_support('portfolio', 'editor');
}
add_action('init', 'remove_wysiwyg');

/*-------------------------------------------------

	--> URL取得（ドメイン以降のみ）

-------------------------------------------------*/

function path_info()
{
  if (isset($_SERVER['PATH_INFO']) && strlen($_SERVER['PATH_INFO']) > 0) {
    return $_SERVER['PATH_INFO'];
  } else if (isset($_SERVER['REQUEST_URI'], $_SERVER['SCRIPT_NAME'])) {
    $url = parse_url('http://example.com' . $_SERVER['REQUEST_URI']);
    if ($url === false) return false;
    return '/' . ltrim(substr($url['path'], strlen(dirname($_SERVER['SCRIPT_NAME']))), '/');
  }
  return false;
}

/*-------------------------------------------------

	--> ドメイン以降、パラメーター以外のパスを取得

-------------------------------------------------*/

function get_pathname()
{
  return parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
}

/*-------------------------------------------------

	--> パラメータ取得

-------------------------------------------------*/

function getParamVal($param)
{
  $val = (isset($_GET[$param]) && $_GET[$param] != '') ? $_GET[$param] : '';
  $val = htmlspecialchars($val, ENT_QUOTES);
  return $val;
}

/*-------------------------------------------------

	--> ステータス取得

-------------------------------------------------*/

function is_parent_slug()
{
  global $post;
  if ($post->post_parent) {
    $post_data = get_post($post->post_parent);
    return $post_data->post_name;
  }
}

/*-------------------------------------------------

	--> カスタム投稿ナンバリンク

-------------------------------------------------*/

function get_post_number($post_type = 'post', $op = '>')
{
  global $wpdb, $post;
  $post_type = is_array($post_type) ? implode("','", $post_type) : $post_type;
  $number = $wpdb->get_var("
      SELECT COUNT( * )
      FROM $wpdb->posts
      WHERE post_date {$op} '{$post->post_date}'
      AND post_status = 'publish'
      AND post_type = ('{$post_type}')
  ");
  return $number;
}

/*-------------------------------------------------

	--> 詳細全ページ取得関数

-------------------------------------------------*/

function get_post_type_detail_all($post_type)
{
  $args = array('post_type' => $post_type, 'posts_per_page' => -1, 'post_status' => 'publish');
  $query = new WP_Query($args);
  $count = $query->found_posts;
  $str = '';
  if ($query->have_posts()) : $i = 1;
    while ($query->have_posts()) : $query->the_post();
      $str .= get_post_field('post_name', get_the_ID());
      if ($i < $count) {
        $str .= '|';
        $i++;
      }
    endwhile;
    wp_reset_postdata();
  endif;
  return $str;
}

/*-------------------------------------------------

	--> 不要な改行コード削除

-------------------------------------------------*/

function remove_nl($text)
{
  return str_replace(array("\r", "\n"), '', $text);
}

/*-------------------------------------------------

	--> 404ページを表示させる

-------------------------------------------------*/

function show_404()
{
  header("HTTP/1.1 404 Not Found");
  require_once($_SERVER['DOCUMENT_ROOT'] . '/404.html');
  exit;
}
