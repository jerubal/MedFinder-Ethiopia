<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function medfinder_enqueue_assets() {
	wp_enqueue_style(
		'medfinder-core-style',
		MEDFINDER_CORE_URL . 'assets/medfinder-core.css',
		array(),
		'1.0.0'
	);
}
add_action( 'wp_enqueue_scripts', 'medfinder_enqueue_assets' );
