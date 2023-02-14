<?php
/*-------------------------------------------------

	--> 記事詳細で前後記事を読み込ませる際に親記事のみを取得

-------------------------------------------------*/

// 有効にするには17,18行目のコメントアウトを外して下さい

function add_post_fillter($where) {
    global $post,$wpdb;
    $post_type = get_post_type($post);
    if ($post_type == 'work') {
        return $where .= $wpdb->prepare( ' AND p.post_parent = %s', 0 );
    }
}
// add_filter( 'get_previous_post_where', 'add_post_fillter' );
// add_filter( 'get_next_post_where', 'add_post_fillter' );
