<?php

function get_preview_id()
{
  if (isset($_GET['preview_id'])) {
    return (int) $_GET['preview_id'];
  } elseif (isset($_GET['p'])) {
    return (int) $_GET['p'];
  } elseif (isset($_GET['page_id'])) {
    return (int) $_GET['page_id'];
  } else {
    return 0;
  }
}

function create_preview_nonce($preview_id)
{
  if (!isset($preview_id)) {
    $preview_id = get_preview_id();
  }
  return wp_create_nonce('post_preview_' . $preview_id);
}

function verify_preview_nonce($preview_id)
{
  if (!isset($_GET['preview_nonce'])) {
    return false;
  }
  if (!isset($preview_id)) {
    $preview_id = get_preview_id();
  }
  return wp_verify_nonce($_GET['preview_nonce'], 'post_preview_' . $preview_id);
}

function get_custom_post_by_id($post_id, $post_type)
{
  $args = array(
    'post_type' => $post_type,
    'p' => $post_id,
    'showposts' => 1,
  );
  $post = get_posts($args);
  if (!$post) {
    show_404();
  }
  return $post[0];
}

function get_post_revision_by_id($post_id)
{
  $args = array(
    'showposts' => 1,
  );
  $revisions = wp_get_post_revisions($post_id, $args);
  $revision_id = array_key_first($revisions);
  return $revisions[$revision_id];
}

function get_custom_post_with_preview($slug, $post_type)
{
  $path = get_page_by_path($slug, 'OBJECT', $post_type);
  if ($path === NULL) {
    show_404();
  } else {
    $post_id = $path->ID;
  }

  // bail early if no preview in URL
  if (!isset($_GET['preview'])) return get_custom_post_by_id($post_id, $post_type);

  // bail early if $post_id is not numeric
  if (!is_numeric($post_id)) return get_custom_post_by_id($post_id, $post_type);

  // vars
  $preview_id = get_preview_id();

  // bail early id $preview_id does not match $post_id
  if ($preview_id != $post_id) return get_custom_post_by_id($post_id, $post_type);

  if (!verify_preview_nonce($preview_id)) return get_custom_post_by_id($post_id, $post_type);

  // attempt find revision
  return get_post_revision_by_id($post_id);
}

/*-------------------------------------------------

  --> // 現在のURLからカスタム投稿タイプを自動判別しpostを取得（プレビュー対応）

-------------------------------------------------*/

function set_custom_post_by_url($post_type = 'post')
{
  global $post;
  $slug = trim(str_replace('/detail.php', '', path_info()), '/');
  if ($slug) {
    $post = get_custom_post_with_preview($slug, $post_type);
    if (!$post) {
      show_404();
    }
  } else {
    if (
      isset($_GET['preview']) && $_GET['preview'] == true
      && isset($_GET['post_type']) && $_GET['post_type'] === $post_type
      && isset($_GET['preview_id']) && verify_preview_nonce($_GET['preview_id'])
    ) {
      $post = get_post_revision_by_id($_GET['preview_id']);
    } else {
      show_404();
    }
  }
  setup_postdata($post);
}

/*-------------------------------------------------

  --> // 指定したスラッグから固定ページを取得しpostにセット（プレビュー対応）

-------------------------------------------------*/

function set_page_by_slug($slug)
{
  // カスタム投稿タイプの新規投稿のプレビューのときは、該当のカスタム投稿タイプの詳細ページへリダイレクトさせてプレビュー表示させる
  $preview_id = get_preview_id();
  if (
    (current_user_can('edit_post', $preview_id)
      || $_GET['_ppp'] && verify_nonce_public_post_preview($_GET['_ppp'], 'public_post_preview_' . $preview_id) // Public Post Previewプラグイン用関数
    )
    && get_pathname() === SITE_ROOT_DIR
    && isset($_GET['preview']) && $_GET['preview'] == true
    && isset($_GET['post_type'])
  ) {
    $redirect = add_query_arg(
      [
        'post_type' => $_GET['post_type'],
        'preview_id' => $preview_id,
        'preview_nonce' => create_preview_nonce($preview_id),
        'preview' => 'true',
      ],
      '/' . $_GET['post_type'] . '/detail.php'
    );
    wp_safe_redirect($redirect);
    return;
  } else if (!verify_preview_nonce($preview_id) && isset($_GET['preview'])) {
    // preview_nonceが存在しないときは、プレビューではなく通常表示にする
    wp_safe_redirect(get_pathname());
    return;
  }

  global $post;
  $post = get_page_by_path($slug);
  if (!$post) {
    show_404();
  }
  setup_postdata($post);
}

/*-------------------------------------------------

  --> // Public Post Previewプラグイン用関数

-------------------------------------------------*/
function nonce_tick_public_post_preview()
{
  $nonce_life = apply_filters('ppp_nonce_life', 2 * DAY_IN_SECONDS); // 2 days.

  return ceil(time() / ($nonce_life / 2));
}

function verify_nonce_public_post_preview($nonce, $action = -1)
{
  $i = nonce_tick_public_post_preview();

  // Nonce generated 0-12 hours ago.
  if (substr(wp_hash($i . $action, 'nonce'), -12, 10) === $nonce) {
    return 1;
  }

  // Nonce generated 12-24 hours ago.
  if (substr(wp_hash(($i - 1) . $action, 'nonce'), -12, 10) === $nonce) {
    return 2;
  }

  // Invalid nonce.
  return false;
}
