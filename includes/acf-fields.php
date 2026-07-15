<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register ACF fields for the "facility" post type in PHP.
 * This keeps your field structure in version control instead of only
 * living in the database — important if you ever move hosts or collaborate.
 *
 * Requires the free or Pro Advanced Custom Fields plugin to be active.
 */
function medfinder_register_acf_fields() {

	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return; // ACF not active — bail safely
	}

	acf_add_local_field_group( array(
		'key'    => 'group_medfinder_facility',
		'title'  => 'Facility Details',
		'fields' => array(
			array(
				'key'   => 'field_facility_phone',
				'label' => 'Phone Number',
				'name'  => 'facility_phone',
				'type'  => 'text',
			),
			array(
				'key'   => 'field_facility_address',
				'label' => 'Address',
				'name'  => 'facility_address',
				'type'  => 'text',
			),
			array(
				'key'   => 'field_facility_hours',
				'label' => 'Operating Hours',
				'name'  => 'facility_hours',
				'type'  => 'text',
				'instructions' => 'e.g. "24 Hours" or "Mon–Sat, 8am–8pm"',
			),
			array(
				'key'   => 'field_facility_24hr',
				'label' => 'Open 24 Hours?',
				'name'  => 'facility_24hr',
				'type'  => 'true_false',
				'ui'    => 1,
			),
			array(
				'key'   => 'field_facility_lat',
				'label' => 'Latitude',
				'name'  => 'facility_lat',
				'type'  => 'number',
				'step'  => 'any',
			),
			array(
				'key'   => 'field_facility_lng',
				'label' => 'Longitude',
				'name'  => 'facility_lng',
				'type'  => 'number',
				'step'  => 'any',
			),
			array(
				'key'   => 'field_facility_services',
				'label' => 'Services Offered',
				'name'  => 'facility_services',
				'type'  => 'textarea',
				'instructions' => 'One service per line, e.g. Emergency Room, Pediatrics, Lab Testing',
			),
		),
		'location' => array(
			array(
				array(
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'facility',
				),
			),
		),
	) );
}
add_action( 'acf/init', 'medfinder_register_acf_fields' );
