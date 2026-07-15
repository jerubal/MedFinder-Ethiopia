<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the "facility" custom post type.
 * Used for hospitals, clinics, pharmacies, and blood banks.
 */
function medfinder_register_facility_cpt() {

	$labels = array(
		'name'               => __( 'Facilities', 'medfinder-core' ),
		'singular_name'      => __( 'Facility', 'medfinder-core' ),
		'add_new_item'       => __( 'Add New Facility', 'medfinder-core' ),
		'edit_item'          => __( 'Edit Facility', 'medfinder-core' ),
		'new_item'           => __( 'New Facility', 'medfinder-core' ),
		'view_item'          => __( 'View Facility', 'medfinder-core' ),
		'search_items'       => __( 'Search Facilities', 'medfinder-core' ),
		'not_found'          => __( 'No facilities found', 'medfinder-core' ),
		'menu_name'          => __( 'MedFinder Facilities', 'medfinder-core' ),
	);

	$args = array(
		'labels'        => $labels,
		'public'        => true,
		'has_archive'   => true,
		'rewrite'       => array( 'slug' => 'facility' ),
		'menu_icon'     => 'dashicons-plus-alt',
		'supports'      => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
		'show_in_rest'  => true, // enables Gutenberg + REST API access, useful if you build a headless view later
		'capability_type' => 'post',
	);

	register_post_type( 'facility', $args );
}
add_action( 'init', 'medfinder_register_facility_cpt' );
