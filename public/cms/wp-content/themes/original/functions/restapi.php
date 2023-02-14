<?php

/*-------------------------------------------------

	--> rest API 外部からAjaxで投稿のカスタムフィールド取得する

-------------------------------------------------*/

// 有効にするには38行目のコメントアウトを外して下さい

function slug_register_onsen() {
    register_rest_field( 'news-topics', //フィールドを追加したいcustom投稿タイプを指定（先ほど登録したカスタム投稿タイプslugを指定）
        'data',
        array(
            'get_callback'  => function(  $object, $field_name, $request  ) {
                // 出力したいカスタムフィールドのキーをここで定義
                $meta_fields = array(
                    'main_image',
                    'main_copy',
                );
                $meta = array();
                foreach ( $meta_fields as $field ) {
                    if($field == 'main_image'){
                        $photo = get_field( $field, $object[ 'id' ] );
                        $meta[ $field ] = $photo['url'];
                      }else{
                        $meta[ $field ] = get_field( $field, $object[ 'id' ]);
                      }
                }
                return $meta;
            },
            'update_callback' => null,
            'schema'          => null,
        )
    );
}

// add_action( 'rest_api_init', 'slug_register_onsen' );