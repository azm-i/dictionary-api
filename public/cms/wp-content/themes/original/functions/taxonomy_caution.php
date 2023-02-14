<?php

/*-------------------------------------------------

	--> タクソノミー設定画面

-------------------------------------------------*/

function taxonomy_caution()
{
?>
  <script type="text/javascript">
    jQuery(function($) {
      if ($('input[name=taxonomy]').val() === 'faq_category') {
        $('.term-name-wrap p').html('サイト上に表示される名前です。<br><strong>※カテゴリ名に「/改行/」を入れるとFAQページでPCのみ改行が入ります</strong>')
      }
    });
  </script>
<?php
}
add_action('admin_print_footer_scripts', 'taxonomy_caution');
