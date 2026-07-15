<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register taxonomies: facility_type (hospital/clinic/pharmacy/blood bank)
 * and facility_region (city/region in Ethiopia).
 */
function medfinder_register_facility_taxonomies() {

	// Facility type
	register_taxonomy(
		'facility_type',
		'facility',
		array(
			'labels'       => array(
				'name'          => __( 'Facility Types', 'medfinder-core' ),
				'singular_name' => __( 'Facility Type', 'medfinder-core' ),
			),
			'hierarchical' => true, // behaves like categories
			'show_in_rest' => true,
			'rewrite'      => array( 'slug' => 'facility-type' ),
		)
	);

	// Region / city
	register_taxonomy(
		'facility_region',
		'facility',
		array(
			'labels'       => array(
				'name'          => __( 'Regions', 'medfinder-core' ),
				'singular_name' => __( 'Region', 'medfinder-core' ),
			),
			'hierarchical' => true,
			'show_in_rest' => true,
			'rewrite'      => array( 'slug' => 'region' ),
		)
	);
}
add_action( 'init', 'medfinder_register_facility_taxonomies' );

/**
 * Seed default terms on plugin activation so the site isn't empty on first run.
 * Safe to call multiple times — wp_insert_term() ignores duplicates.
 */
function medfinder_seed_default_terms() {
	$types = array( 'Hospital', 'Clinic', 'Pharmacy', 'Blood Bank' );
	foreach ( $types as $type ) {
		if ( ! term_exists( $type, 'facility_type' ) ) {
			wp_insert_term( $type, 'facility_type' );
		}
	}

	$regions = array( 'Addis Ababa', 'Bahir Dar', 'Hawassa', 'Mekelle', 'Adama', 'Dire Dawa' );
	foreach ( $regions as $region ) {
		if ( ! term_exists( $region, 'facility_region' ) ) {
			wp_insert_term( $region, 'facility_region' );
		}
	}
}
register_activation_hook( MEDFINDER_CORE_PATH . 'medfinder-core.php', 'medfinder_seed_default_terms' );
