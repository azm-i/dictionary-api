<?php

/*-------------------------------------------------

	--> タクソノミー選択画面で一つだけしか選択できないようにする。

-------------------------------------------------*/

// 有効にするには29行目のコメントアウトを削除して、news_tagを任意のものに変更下さい

function taxonomy_select_to_radio()
{
?>
  <script type="text/javascript">
    jQuery(function($) {
      // 投稿画面
      $('#faq_categorychecklist>li>ul>li input[type=checkbox]').each(function() {
        $(this).replaceWith($(this).clone().attr('type', 'radio'));
      });
      for (let i = 0; i < $('#faq_categorychecklist>li').length; i++) {
        let $target = $('#faq_categorychecklist>li').eq(i).children('.selectit');
        if ($target.next('.children').length > 0) {
          $target.css({
            'pointer-events': 'none',
          });
          $target.find('input[type=checkbox]').css({
            'opacity': '0',
            'width': '0',
            'min-width': '0',
            'margin': '0',
            'border': 'none',
          });
          for (let j = 0; j < $target.next('.children').find('li').length; j++) {
            let $targetChild = $target.next('.children').find('li').eq(j).children('.selectit');
            let _text = $targetChild.html();
            $targetChild.html(_text.replace("/改行/", ""));
          }
        } else {
          $target.find('input[type=checkbox]').each(function() {
            $(this).replaceWith($(this).clone().attr('type', 'radio'));
          });
          let _text = $target.text();
          $target.text(_text.replace("/改行/", ""));
        }
      }
      $('#faq_categorychecklist>li>ul>li input').change(function() {
        $('#faq_categorychecklist>li>.selectit>input').prop('checked', false);

        function parentNodes(checked, nodes) {
          parents = nodes.parent().parent().parent().prev().children('input');
          if (parents.length != 0) {
            parents[0].checked = checked;
            parentNodes(checked, parents);
          }
        }
        var checked = $(this).is(':checked');
        $(this).parent().parent().siblings().children('label').children('input').each(function() {
          checked = checked || $(this).is(':checked');
        })
        parentNodes(checked, $(this));
      });
      $('#taxonomy-store_category input[type=checkbox]').each(function() {
        $(this).replaceWith($(this).clone().attr('type', 'radio'));
      });
      $('#taxonomy-lineup_category input[type=checkbox]').each(function() {
        $(this).replaceWith($(this).clone().attr('type', 'radio'));
      });

      // 一覧画面
      $('.faq_category-checklist input[type=checkbox]').click(function() {
        $(this).parents('.faq_category-checklist').find(' input[type=checkbox]').attr('checked', false);
        $(this).attr('checked', true);
      });
      $('.store_category-checklist input[type=checkbox]').click(function() {
        $(this).parents('.store_category-checklist').find(' input[type=checkbox]').attr('checked', false);
        $(this).attr('checked', true);
      });
      $('.lineup_category-checklist input[type=checkbox]').click(function() {
        $(this).parents('.store_category-checklist').find(' input[type=checkbox]').attr('checked', false);
        $(this).attr('checked', true);
      });
    });
  </script>
<?php
}
add_action('admin_print_footer_scripts', 'taxonomy_select_to_radio');
