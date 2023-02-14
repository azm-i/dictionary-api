<?php

/*-------------------------------------------------

	--> PagerNavi プラグイン カスタマイズ（こっちは使ってない）

-------------------------------------------------*/

function my_custom_pagination($html) {
  $out = '';

  //wrap a's and span's in li's
  $out = str_replace('<div','',$html);
  $out = str_replace("class='wp-pagenavi' role='navigation'>",'',$out);
  $out = str_replace('<a','<li class="p-pager__index__next"><a class="js-pjax"',$out);
  $out = str_replace('</a>','</a></li>',$out);
  $out = str_replace('<span','<li class="p-pager__index__current"',$out);
  $out = str_replace('</span>','</li>',$out);
  $out = str_replace('</div>','',$out);

  return
  '<ul class="p-pager__index">'.$out.'</ul>';

}
//add_filter( 'wp_pagenavi', 'my_custom_pagination', 10, 2 );

/*-------------------------------------------------

	--> ページャー 自作（こっちを使ってる）

-------------------------------------------------*/
/*
* original_pager
*
* ワードプレスのアーカイブページのページャーを作成する。
*
*
* @param array $args {
*   @type string prev_text ：前ページリンクのテキスト、空にすると非表示。初期値、'←'.
*   @type string next_text ：次ページリンクのテキスト、空にすると非表示。初期値、'→'.
*   @type string first_text ：最初のページへのリンクのテキスト、空にすると非表示。初期値、'first'.
*   @type string last_text ：最後のページへのリンクのテキスト、空にすると非表示。初期値、'last'.
*   @type int visit_nth ：currentページを含む総ページ数。奇数を入力、偶数設定の場合は＋1した場合と同じ結果。初期値、5.
*   @type boolean last_number ：最後のナンバーが表示がされていない時に「...12」の様な表示をする。初期値、true.
*   @type string output ：'return'もしくは'echo'を指定。'return'にすると文字列を返す。初期値、'echo'.
* }
*/
function original_pager($args = null){
  global $wp_query;

  $my_setting = array(
    'prev_text' => '←',
    'next_text' => '→',
    'first_text' => 'first',
    'last_text' => 'last',
    'visit_nth' => 5,
    'first_number' => true,
    'last_number' => true,
    'output' => 'echo',
  );
  if(is_array($args)) $my_setting = array_merge($my_setting,$args);

  //url関係
  $now_page_data = parse_url($_SERVER["REQUEST_URI"]);
  $base_url = preg_replace('/\/page\/.*/','/',$now_page_data['path']);
  $url_query = $now_page_data['query'] ? '?'.$now_page_data['query'] : '';
  $max_page = intval($wp_query->max_num_pages);
  $page_nth = (get_query_var('paged')) ? get_query_var('paged') : 1;
  $last_page = "{$base_url}page/{$max_page}/{$url_query}";

  //次のページと前のページの取得
  $next_page = $my_setting['next_text'] ? get_next_posts_page_link() : 'hidden';
  $prev_page = $my_setting['prev_text'] ? get_previous_posts_page_link() : 'hidden';

  //数字の左と右の表示数を設定
  if($my_setting['visit_nth']%2==0){
    $base_nth = $my_setting['visit_nth']/2 ;
  }else{
    $base_nth = ($my_setting['visit_nth'] - 1) / 2;
  }

  ////前
  if(($max_page - $page_nth) < $base_nth){
    if($base_nth * 2 - ($max_page - $page_nth) >= $page_nth){
      $mae = $page_nth-1;
    }else{
      // $mae = $base_nth * 2 - ($max_page - $page_nth);
      $mae = $base_nth - ($max_page - $page_nth);
    }
  }else{
    if($base_nth >= $page_nth){
      $mae = $page_nth - 1;
    }else{
      $mae = $base_nth;
    }
  }

  ////後
  if($base_nth >= $page_nth){
    if($base_nth*2 - $mae >= $max_page - $page_nth){
      $ato = $max_page - $page_nth;
    }else{
      // $ato = $base_nth*2 - $mae;
      $ato = $base_nth - $mae;
    }
  }else{
    if($base_nth >= $max_page - $page_nth){
      $ato = $max_page - $page_nth;
    }else{
      $ato = $base_nth;
    }
  }

  ////点々表示
  $key = false;
  if(($ato + $page_nth) < $max_page){
    $key = true;
  }


  $html = '<div class="t-news_list__pager">
  <nav class="p-pager">';

  //最初
  if($my_setting['first_text']){
    if($page_nth !== 1){
      $html .= "<p class=\"first\"><a href=\"{$base_url}{$url_query}\">{$my_setting['first_text']}</a></p>";
    }else{
      $html .= "<p class=\"first\"><span class=\"no-link\">{$my_setting['first_text']}</span></p>";
    }
  }

  //前
  if($prev_page !== 'hidden' && strpos($prev_page,'/page/')){
    $html .= "<a class='p-pager__prev js-pjax' href='{$prev_page}'><span></span></a>";
  }elseif(!$prev_page || !strpos($prev_page,'/page/')){
    $html .= "<a class='p-pager__prev p-pager__prev--disabled js-pjax' href='{$prev_page}'><span></span></a>";
  }

  //数字関係
  $html .= '<ul class="p-pager__index">';

  ////数字一番初め
  if($page_nth > 5 && $my_setting['first_number']){
    $html .= <<<EOT
    <li class="p-pager__index__first"><a class="js-pjax" href="{$base_url}"><span>01</span></a></li>
EOT;
  }

  ////前の数字
  while($mae>0){
    $mae_nth = $page_nth - $mae;
    $mae_nth_text = ($mae_nth < 10)? sprintf('%02d', $mae_nth) : $mae_nth;
    $html .= "<li class='p-pager__index__before'><a class='js-pjax' href='{$base_url}page/{$mae_nth}/{$url_query}'><span>{$mae_nth_text}</span></a></li>";
    $mae--;
  }

  ////現在
  $page_nth_text = ($page_nth < 10)? sprintf('%02d', $page_nth) : $page_nth;
  $html .= "<li class='p-pager__index__current'><span>{$page_nth_text}</span></li>";

  ////後の数字
  $i = 1;
  while($ato>0){
    $ato_nth = $page_nth + $i;
    $ato_nth_text = ($ato_nth < 10)? sprintf('%02d', $ato_nth) : $ato_nth;
    $html .= "<li class='p-pager__index__next'><a class='js-pjax' href='{$base_url}page/{$ato_nth}/{$url_query}'><span>{$ato_nth_text}</span></a></li>";
    $ato--;
    $i++;
  }

  ////数字それ以上
  if($key && $my_setting['last_number']){
    $max_page_text = ($max_page < 10)? sprintf('%02d', $max_page) : $max_page;
    $html .= <<<EOT
    <li class='p-pager__index__end'><a class='js-pjax' href='{$base_url}page/{$max_page}/{$url_query}'><span>{$max_page_text}</span></a></li>
EOT;
  }

  $html .= "</ul>";

  //次
  intval($max_page)+1;
  if($next_page !== 'hidden' && !strpos($next_page,'/'.intval($max_page+1).'/')){
    $html .= "<a class='p-pager__next js-pjax' href='{$next_page}'><span></span></a>";
  }elseif(!$next_page || strpos($next_page,'/'.intval($max_page+1).'/')){
    $html .= "<a class='p-pager__next p-pager__next--disabled js-pjax' href='{$next_page}'><span></span></a>";
  }

  //最後
  // if($my_setting['last_text']){
  //   if($page_nth !== $max_page){
  //     $html .= "<p class=\"last\"><a href=\"{$last_page}\">{$my_setting['last_text']}</a></p>";
  //   }else{
  //     $html .= "<p class=\"last\"><span class=\"no-link\">{$my_setting['last_text']}</span></p>";
  //   }
  // }

  $html .= "</nav>
  </div>";

  if($my_setting['output'] == 'echo'){
    echo $html;
    return;
  }else{
    return $html;
  }

}

/*-------------------------------------------------

	--> 一覧1ページ表示件数

-------------------------------------------------*/

add_action( 'pre_get_posts', 'my_custom_query_vars' );
function my_custom_query_vars( $query ) {

	if ( !is_admin() && $query->is_main_query()) {
    if ( is_post_type_archive('news') ||
    is_tax('news_cat') ) {
      $query->set( 'posts_per_page' , 10 );
		}
	}
	return $query;
}
