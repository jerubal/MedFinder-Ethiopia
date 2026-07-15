<?php
/**
 * Plugin Name: MedFinder Core
 * Description: Core functionality for MedFinder Ethiopia — facility directory, taxonomies, ACF fields, and search shortcode.
 * Version:     1.0.0
 * Author:      Your Name
 * Text Domain: medfinder-core
 *
 * Requires: Advanced Custom Fields (free or Pro)
 */

// Block direct access
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MEDFINDER_CORE_PATH', plugin_dir_path( __FILE__ ) );
define( 'MEDFINDER_CORE_URL', plugin_dir_url( __FILE__ ) );

// Load plugin pieces
require_once MEDFINDER_CORE_PATH . 'includes/cpt-facility.php';
require_once MEDFINDER_CORE_PATH . 'includes/taxonomies.php';
require_once MEDFINDER_CORE_PATH . 'includes/acf-fields.php';
require_once MEDFINDER_CORE_PATH . 'includes/shortcode-search.php';
require_once MEDFINDER_CORE_PATH . 'includes/enqueue-assets.php';

/**
 * Flush rewrite rules on activation so the new post type's URLs work immediately.
 */
function medfinder_core_activate() {
	medfinder_register_facility_cpt();
	medfinder_register_facility_taxonomies();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'medfinder_core_activate' );

function medfinder_core_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'medfinder_core_deactivate' );
