<?php

/*-------------------------------------------------

	--> WordPress 不要な設定の削除

-------------------------------------------------*/

// jQuery DELETE
function my_dequeue_styles() {
    wp_deregister_script( 'jquery' );
}
//add_action( 'wp_print_styles', 'my_dequeue_styles' );

remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles', 10 );

//WordPressのバージョン「?ver=~」のみを削除する
function vc_remove_wp_ver_css_js( $src ) {
    if ( strpos( $src, 'ver=' . get_bloginfo( 'version' ) ) )
        $src = remove_query_arg( 'ver', $src );
    return $src;
}
add_filter( 'style_loader_src', 'vc_remove_wp_ver_css_js', 9999 );
add_filter( 'script_loader_src', 'vc_remove_wp_ver_css_js', 9999 );

// サムネイルの情報を削除
function remove_img_attr($html, $id, $alt, $title, $align, $size) {
    list($img_src, $width, $height) = image_downsize($id, $size);
    $hwstring = image_hwstring($width, $height);
    $html = str_replace($hwstring, '', $html);
    $html = preg_replace('/title=[\'"]([^\'"]+)[\'"]/i', '', $html);
    return preg_replace('/ class=[\'"]([^\'"]+)[\'"]/i', '', $html);
}
add_filter('get_image_tag','remove_img_attr', 10, 6);

remove_action('wp_head', '_wp_render_title_tag', 1);

/**
 * Returning an authentication error if a user who is not logged in tries to query the REST API
 * @param $access
 * @return WP_Error
 * Author: Dave McHale
 * Author URI: http://www.binarytemplar.com
 */
//function DRA_only_allow_logged_in_rest_access( $access ) {
//    if( ! is_user_logged_in() ) {
//        return new WP_Error( 'rest_cannot_access', __( 'Only authenticated users can access the REST API.', 'disable-json-api' ), array( 'status' => rest_authorization_required_code() ) );
//    }
//    return $access;
//}
//add_filter( 'rest_authentication_errors', 'DRA_only_allow_logged_in_rest_access' );