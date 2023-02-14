<?php

/*-------------------------------------------------

	--> // CSS JSをここで管理したい用

-------------------------------------------------*/

// 有効にするには19,29行目のコメントアウトを削除して下さい

//
///**
// * enqueue stylesheet files
// */
function wp_enqueue_scripts__styles() {
 wp_enqueue_style( 'style', get_stylesheet_directory_uri() . '/assets/css/style.css', array(), null );
 wp_enqueue_script( 'header-head', get_stylesheet_directory_uri() . '/assets/js/head.js?1', array(), null );
}
//add_action( 'wp_enqueue_scripts', 'wp_enqueue_scripts__styles' );

///**
// * enqueue javascript files
// */
function wp_enqueue_scripts__scripts() {
 wp_enqueue_script( 'footer-lib', get_stylesheet_directory_uri() . '/assets/js/lib.js?1', array(), null, true);
 wp_enqueue_script( 'footer-webgl-lib', get_stylesheet_directory_uri() . '/assets/js/webgl-lib.js', array(), null, true);
 wp_enqueue_script( 'footer-app', get_stylesheet_directory_uri() . '/assets/js/app.js', array(), null, true);
}
//add_action( 'wp_enqueue_scripts', 'wp_enqueue_scripts__scripts' );
