<?php

/*-------------------------------------------------

	--> 検索結果のテンプレート指定

-------------------------------------------------*/

function search_template_redirect() {
	global $wp_query;
	$wp_query->is_search = true;
	$wp_query->is_home = false;
	if (file_exists(TEMPLATEPATH . '/search.php')) {
	include(TEMPLATEPATH . '/search.php');
}
exit;
}
if (isset($_GET['s']) && $_GET['s'] == false) {
	add_action('template_redirect', 'search_template_redirect');
}

/*-------------------------------------------------

	--> 検索結果を対象ページのみとする

-------------------------------------------------*/

// 有効にするには40行目のコメントアウトを外し、postNAMEを任意のものに変更ください

function my_posts_search( $search, $wp_query ){
    // 検索結果ページ・メインクエリ・管理画面以外の条件が揃った場合
    if ( $wp_query->is_search() && $wp_query->is_main_query() && !is_admin() ){
        // 検索結果を投稿ページのみとする
        $search .= " AND post_type = 'postNAME' ";
        return $search;
    }
    // 上記条件分岐以外は、検索結果を変更しない
    return $search;
}
// add_filter('posts_search','my_posts_search', 10, 2);