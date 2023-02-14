<?php
// メディアサイズ別生成させない
function my_intermediate_image_sizes($sizes) {
  $delete = array('large','medium_large');
  return array_diff($sizes, $delete);
}
add_filter('intermediate_image_sizes', 'my_intermediate_image_sizes');

// SVG使えるように
function add_file_types_to_uploads($file_types){

  $new_filetypes = array();
  $new_filetypes['svg'] = 'image/svg+xml';
  $file_types = array_merge($file_types, $new_filetypes );

  return $file_types;
}
add_action('upload_mimes', 'add_file_types_to_uploads');

// Webp対応
function custom_mime_types( $mimes ) {
  $mimes['webp'] = 'image/webp';
  return $mimes;
}
add_filter( 'upload_mimes', 'custom_mime_types' );
