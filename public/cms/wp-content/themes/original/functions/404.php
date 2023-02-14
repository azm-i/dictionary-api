<?php

/*-------------------------------------------------

	--> // 404ページが無く、TOPページにリダイレクトさせる用

-------------------------------------------------*/

/*if ( ! is_admin() ) {
  add_action( 'template_redirect', 'is404_redirect_home' );

  function is404_redirect_home() {
    if ( is_404() ) {
      wp_safe_redirect( home_url( '/' ) );
      exit();
    }
  }
}*/
