<?php

/*-------------------------------------------------

	--> クラシックエディター　デフォルト変更

-------------------------------------------------*/

function my_tiny_mce_before_init( $mceInit, $editor_id ) {
	$mceInit['allow_script_urls'] = true;
	if ( ! isset( $mceInit['extended_valid_elements'] ) ) {
		$mceInit['extended_valid_elements'] = '';
	} else {
		$mceInit['extended_valid_elements'] .= ',';
	}
	$mceInit['extended_valid_elements'] .= 'button[onclick]';
	return $mceInit;
}
// add_filter( 'tiny_mce_before_init', 'my_tiny_mce_before_init', 10, 2 );

/*-------------------------------------------------

	--> ビジュアル、テキストモードを選択できないようにする

-------------------------------------------------*/

function stop_rich_editor( $editor ) {
  $pt = get_post_type();
  if ( $pt === 'page')
  return false;
  return $default;
 }
//  add_filter( 'user_can_richedit', 'stop_rich_editor' );

/*-------------------------------------------------

	--> ビジュアルエディタがタグを勝手に削除するのを阻止

-------------------------------------------------*/

function custom_tiny_mce_before_init( $init_array ) {
  global $allowedposttags;

  $init_array['valid_elements'] = '*[*]'; //すべてのタグを許可(削除されないように)
  $init_array['extended_valid_elements'] = '*[*]'; //すべてのタグを許可(削除されないように)
  $init_array['valid_children'] = '+a[' . implode( '|', array_keys( $allowedposttags ) ) . ']'; //aタグ内にすべてのタグを入れられるように
  $init_array['indent'] = true; //インデントを有効に
  $init_array['wpautop'] = false; //テキストやインライン要素を自動的にpタグで囲む機能を無効に
  $init_array['force_p_newlines'] = false; //改行したらpタグを挿入する機能を無効に

  return $init_array;
}
// add_filter( 'tiny_mce_before_init', 'custom_tiny_mce_before_init' );
