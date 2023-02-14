<?php
/*-------------------------------------------------

	--> REST APIを無効化（利用したい場合はコメントアウト）

-------------------------------------------------*/
function disable_rest_api()
{
  return new WP_Error('disabled', __('REST API is disabled.'), array('status' => rest_authorization_required_code()));
}
// add_filter('rest_authentication_errors', 'disable_rest_api');

/*-------------------------------------------------

	--> サイトのURL/?author=1でのユーザー名の漏洩を防止

-------------------------------------------------*/
function theme_slug_redirect_author_archive()
{
  if (is_author()) {
    wp_redirect(home_url());
    exit;
  }
}
add_action('template_redirect', 'theme_slug_redirect_author_archive');

/*-------------------------------------------------

	--> REST APIでカスタムフィールドの値でフィルタリングできるようにする

-------------------------------------------------*/
// Register a REST route
add_action('rest_api_init', function () {
  //Path to meta query route
  register_rest_route('hachi/v2', '/news/', array(
    'methods' => 'GET',
    'callback' => 'custom_meta_query_hachi'
  ));
});

// Do the actual query and return the data
function custom_meta_query_hachi()
{
  // Set the arguments based on our get parameters
  $args = array(
    'post_type' => 'news',
    'post_status' => 'publish',
    'order'   => 'DESC',
    'posts_per_page' => 3,
    'meta_key' => 'brand', //カスタムフィールドのキー
    'meta_value' => 'hachi', //カスタムフィールドの値
    'meta_compare' => 'LIKE' //'meta_value'のテスト演算子
  );
  // Run a custom query
  $meta_query = new WP_Query($args);
  if ($meta_query->have_posts()) {
    //Define and empty array
    $data = array();
    // Store each post's title in the array
    while ($meta_query->have_posts()) {
      $meta_query->the_post();
      array_push($data, array(
        "link" => get_the_permalink(),
        "date" => get_the_date('Y.m.d'),
        "title" => get_the_title(),
        "image" => ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . get_the_post_thumbnail_url(get_the_ID(), 'full'),
      ));
    }
    // Return the data
    return $data;
  } else {
    // If there is no post
    return 'No post to show';
  }
}

/*-------------------------------------------------

	--> 特定のデフォルトエンドポイントを消す

-------------------------------------------------*/
function unset_rest_endpoints($endpoints)
{
  // if (isset($endpoints['/wp/v2/posts'])) {
  //   unset($endpoints['/wp/v2']);
  // }
  // if (isset($endpoints['/wp/v2/posts'])) {
  //   unset($endpoints['/wp/v2/posts']);
  // }
  // if (isset($endpoints['/wp/v2/posts'])) {
  //   unset($endpoints['/wp/v2/posts']);
  // }
  // if (isset($endpoints['/wp/v2/posts/(?P<id>[\d]+)'])) {
  //   unset($endpoints['/wp/v2/posts/(?P<id>[\d]+)']);
  // }
  // if (isset($endpoints['/wp/v2/posts/(?P<parent>[\d]+)/revisions'])) {
  //   unset($endpoints['/wp/v2/posts/(?P<parent>[\d]+)/revisions']);
  // }
  // if (isset($endpoints['/wp/v2/posts/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)'])) {
  //   unset($endpoints['/wp/v2/posts/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)']);
  // }
  // if (isset($endpoints['/wp/v2/pages'])) {
  //   unset($endpoints['/wp/v2/pages']);
  // }
  // if (isset($endpoints['/wp/v2/pages/(?P<id>[\d]+)'])) {
  //   unset($endpoints['/wp/v2/pages/(?P<id>[\d]+)']);
  // }
  // if (isset($endpoints['/wp/v2/pages/(?P<parent>[\d]+)/revisions'])) {
  //   unset($endpoints['/wp/v2/pages/(?P<parent>[\d]+)/revisions']);
  // }
  // if (isset($endpoints['/wp/v2/pages/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)'])) {
  //   unset($endpoints['/wp/v2/pages/(?P<parent>[\d]+)/revisions/(?P<id>[\d]+)']);
  // }
  if (isset($endpoints['/wp/v2/media'])) {
    unset($endpoints['/wp/v2/media']);
  }
  if (isset($endpoints['/wp/v2/media/(?P<id>[\d]+)'])) {
    unset($endpoints['/wp/v2/media/(?P<id>[\d]+)']);
  }
  // if (isset($endpoints['/wp/v2/types'])) {
  //   unset($endpoints['/wp/v2/types']);
  // }
  // if (isset($endpoints['/wp/v2/types/(?P<type>[\w-]+)'])) {
  //   unset($endpoints['/wp/v2/types/(?P<type>[\w-]+)types']);
  // }
  if (isset($endpoints['/wp/v2/statuses'])) {
    unset($endpoints['/wp/v2/statuses']);
  }
  if (isset($endpoints['/wp/v2/statuses/(?P<status>[\w-]+)'])) {
    unset($endpoints['/wp/v2/statuses/(?P<status>[\w-]+)']);
  }
  // if (isset($endpoints['/wp/v2/taxonomies'])) {
  //   unset($endpoints['/wp/v2/taxonomies']);
  // }
  // if (isset($endpoints['/wp/v2/taxonomies/(?P<taxonomy>[\w-]+)'])) {
  //   unset($endpoints['/wp/v2/taxonomies/(?P<taxonomy>[\w-]+)']);
  // }
  // if (isset($endpoints['/wp/v2/categories'])) {
  //   unset($endpoints['/wp/v2/categories']);
  // }
  // if (isset($endpoints['/wp/v2/categories/(?P<id>[\d]+)'])) {
  //   unset($endpoints['/wp/v2/categories/(?P<id>[\d]+)']);
  // }
  // if (isset($endpoints['/wp/v2/tags'])) {
  //   unset($endpoints['/wp/v2/tags']);
  // }
  // if (isset($endpoints['/wp/v2/tags/(?P<id>[\d]+)'])) {
  //   unset($endpoints['/wp/v2/tags/(?P<id>[\d]+)']);
  // }
  if (isset($endpoints['/wp/v2/users'])) {
    unset($endpoints['/wp/v2/users']);
  }
  if (isset($endpoints['/wp/v2/users/(?P<id>[\d]+)'])) {
    unset($endpoints['/wp/v2/users/(?P<id>[\d]+)']);
  }
  if (isset($endpoints['/wp/v2/users/me'])) {
    unset($endpoints['/wp/v2/users/me']);
  }
  if (isset($endpoints['/wp/v2/users/(?P<user_id>(?:[\d]+|me))/application-passwords'])) {
    unset($endpoints['/wp/v2/users/(?P<user_id>(?:[\d]+|me))/application-passwords']);
  }
  if (isset($endpoints['/wp/v2/users/(?P<user_id>(?:[\d]+|me))/application-passwords/introspect'])) {
    unset($endpoints['/wp/v2/users/(?P<user_id>(?:[\d]+|me))/application-passwords/introspect']);
  }
  if (isset($endpoints['/wp/v2/users/(?P<user_id>(?:[\d]+|me))/application-passwords/(?P<uuid>[\w\-]+)'])) {
    unset($endpoints['/wp/v2/users/(?P<user_id>(?:[\d]+|me))/application-passwords/(?P<uuid>[\w\-]+)']);
  }
  if (isset($endpoints['/wp/v2/comments'])) {
    unset($endpoints['/wp/v2/comments']);
  }
  if (isset($endpoints['/wp/v2/comments/(?P<id>[\d]+)'])) {
    unset($endpoints['/wp/v2/comments/(?P<id>[\d]+)']);
  }
  if (isset($endpoints['/wp/v2/settings'])) {
    unset($endpoints['/wp/v2/settings']);
  }
  return $endpoints;
}
add_action('rest_endpoints', 'unset_rest_endpoints');
