<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function bac_register_devotional_cpt() {
	register_post_type( 'devotional', array(
		'labels'       => array(
			'name'          => 'Devotionals',
			'singular_name' => 'Devotional',
			'add_new_item'  => 'Add New Devotional',
			'edit_item'     => 'Edit Devotional',
		),
		'public'       => true,
		'show_in_rest' => true,
		'rest_base'    => 'devotionals',
		'menu_icon'    => 'dashicons-book-alt',
		'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
		'has_archive'  => true,
	) );
}
add_action( 'init', 'bac_register_devotional_cpt' );

function bac_register_sermon_note_cpt() {
	register_post_type( 'sermon_note', array(
		'labels'       => array(
			'name'          => 'Sermon Notes',
			'singular_name' => 'Sermon Note',
			'add_new_item'  => 'Add New Sermon Note',
			'edit_item'     => 'Edit Sermon Note',
		),
		'public'       => true,
		'show_in_rest' => true,
		'rest_base'    => 'sermon_notes',
		'menu_icon'    => 'dashicons-microphone',
		'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
		'has_archive'  => true,
	) );
}
add_action( 'init', 'bac_register_sermon_note_cpt' );

function bac_register_meta_fields() {
	$common_meta = array(
		'scripture_reference' => array(
			'type'        => 'string',
			'description' => 'e.g. John 3:16 or Psalm 23:1-6',
		),
		'content_date' => array(
			'type'        => 'string',
			'description' => 'YYYY-MM-DD',
		),
	);

	foreach ( array( 'devotional', 'sermon_note' ) as $post_type ) {
		foreach ( $common_meta as $key => $args ) {
			register_post_meta( $post_type, $key, array(
				'type'          => $args['type'],
				'description'   => $args['description'],
				'single'        => true,
				'show_in_rest'  => true,
				'auth_callback' => function() {
					return current_user_can( 'edit_posts' );
				},
			) );
		}
	}
}
add_action( 'init', 'bac_register_meta_fields' );

function bac_register_favorites_routes() {
	register_rest_route( 'bibleapp/v1', '/favorites', array(
		array(
			'methods'             => 'GET',
			'callback'            => 'bac_get_favorites',
			'permission_callback' => 'bac_require_login',
		),
		array(
			'methods'             => 'POST',
			'callback'            => 'bac_add_favorite',
			'permission_callback' => 'bac_require_login',
		),
		array(
			'methods'             => 'DELETE',
			'callback'            => 'bac_remove_favorite',
			'permission_callback' => 'bac_require_login',
		),
	) );
}
add_action( 'rest_api_init', 'bac_register_favorites_routes' );

function bac_require_login() {
	return is_user_logged_in();
}

function bac_get_favorites() {
	$user_id   = get_current_user_id();
	$favorites = get_user_meta( $user_id, 'bac_favorites', true );
	if ( ! is_array( $favorites ) ) $favorites = array();
	return rest_ensure_response( $favorites );
}

function bac_add_favorite( WP_REST_Request $request ) {
	$user_id   = get_current_user_id();
	$reference = sanitize_text_field( $request->get_param( 'reference' ) );
	$text      = sanitize_textarea_field( $request->get_param( 'text' ) );

	if ( empty( $reference ) ) {
		return new WP_Error( 'missing_reference', 'A "reference" field is required.', array( 'status' => 400 ) );
	}

	$favorites = get_user_meta( $user_id, 'bac_favorites', true );
	if ( ! is_array( $favorites ) ) $favorites = array();

	foreach ( $favorites as $fav ) {
		if ( $fav['reference'] === $reference ) return rest_ensure_response( $favorites );
	}

	$favorites[] = array(
		'reference' => $reference,
		'text'      => $text,
		'added_at'  => current_time( 'mysql' ),
	);

	update_user_meta( $user_id, 'bac_favorites', $favorites );
	return rest_ensure_response( $favorites );
}

function bac_remove_favorite( WP_REST_Request $request ) {
	$user_id   = get_current_user_id();
	$reference = sanitize_text_field( $request->get_param( 'reference' ) );

	$favorites = get_user_meta( $user_id, 'bac_favorites', true );
	if ( ! is_array( $favorites ) ) $favorites = array();

	$favorites = array_values( array_filter( $favorites, function( $fav ) use ( $reference ) {
		return $fav['reference'] !== $reference;
	} ) );

	update_user_meta( $user_id, 'bac_favorites', $favorites );
	return rest_ensure_response( $favorites );
}

function bac_enable_cors() {
	remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
	add_filter( 'rest_pre_serve_request', function( $value ) {
		header( 'Access-Control-Allow-Origin: *' );
		header( 'Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS' );
		header( 'Access-Control-Allow-Credentials: true' );
		header( 'Access-Control-Allow-Headers: Authorization, Content-Type' );
		return $value;
	} );
}
add_action( 'rest_api_init', 'bac_enable_cors', 15 );
