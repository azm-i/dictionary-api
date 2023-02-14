<?php

/*-------------------------------------------------

	--> URL rewrite

-------------------------------------------------*/

// 有効にするには12〜14行目のコメントアウトを外して下さい

if ( !is_admin()) {
  // add_filter('rewrite_rules_array','wp_insertMyRewriteRules');
  // add_filter('query_vars','wp_insertMyRewriteQueryVars');
  // add_filter('init','flushRules');
}

// パーマリンク更新をしなくても反映されるように
function flushRules(){
    global $wp_rewrite;
    $wp_rewrite->flush_rules();
}

// 新しいルールを追加
function wp_insertMyRewriteRules($rules)
{

  $URI = get_uri();
  $URI = explode("/",$URI);

  // News用
  if ($URI[1] === 'news') {
    $str = get_post_type_detail_all('news');
    $newrules = array(
      // 詳細
      'news/(('.$str.'))/?$' => 'index.php?post_type=news&name=$matches[1]',
      // News 一覧
      'news/page/?([0-9]{1,})/?$' => 'index.php?post_type=news&paged=$matches[1]',
      // News カテゴリー一覧
      'news/(.+?)/page/?([0-9]{1,})/?$' => 'index.php?news_cat=$matches[1]&paged=$matches[2]',
      'news/(.+?)/?$' => 'index.php?news_cat=$matches[1]',
    );
  }
  return $newrules + $rules;
}

// 変数idを追加して、WordPressが認識できるようにする
function wp_insertMyRewriteQueryVars($vars)
{
    array_push($vars, 'id');
    return $vars;
}
