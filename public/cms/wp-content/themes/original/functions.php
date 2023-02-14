<?php
if (is_dir($dir = get_stylesheet_directory() . '/functions/')) {
  foreach (glob($dir . '*.php') as $load_file) {
    require_once $load_file;
  }
}
