<?php
/*-------------------------------------------------

-	--> URLを数値化

-------------------------------------------------*/

// 有効にするには16行目のコメントアウトを削除して、postTypeNAMEを任意のものに変更下さい

function auto_post_slug( $slug, $post_ID, $post_status, $post_type ) {
  if ( $post_type == 'postTypeNAME') {
    $slug = $post_ID;
  }
  return $slug;
}
// add_filter( 'wp_unique_post_slug', 'auto_post_slug', 10, 4  );
