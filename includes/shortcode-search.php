<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * [medfinder_search] shortcode.
 * Drop this into any Elementor page using the "Shortcode" widget
 * to render a facility search + filter form and results grid.
 */
function medfinder_search_shortcode( $atts ) {

	// Handle the search request
	$search_term = isset( $_GET['mf_search'] ) ? sanitize_text_field( $_GET['mf_search'] ) : '';
	$region      = isset( $_GET['mf_region'] ) ? sanitize_text_field( $_GET['mf_region'] ) : '';
	$type        = isset( $_GET['mf_type'] ) ? sanitize_text_field( $_GET['mf_type'] ) : '';

	$tax_query = array( 'relation' => 'AND' );
	if ( $region ) {
		$tax_query[] = array(
			'taxonomy' => 'facility_region',
			'field'    => 'slug',
			'terms'    => $region,
		);
	}
	if ( $type ) {
		$tax_query[] = array(
			'taxonomy' => 'facility_type',
			'field'    => 'slug',
			'terms'    => $type,
		);
	}

	$query_args = array(
		'post_type'      => 'facility',
		'posts_per_page' => 20,
		's'              => $search_term,
	);
	if ( count( $tax_query ) > 1 ) {
		$query_args['tax_query'] = $tax_query;
	}

	$facilities = new WP_Query( $query_args );

	ob_start();
	?>
	<form class="medfinder-search-form" method="get">
		<input type="text" name="mf_search" placeholder="Search by name..." value="<?php echo esc_attr( $search_term ); ?>">

		<select name="mf_region">
			<option value="">All Regions</option>
			<?php foreach ( get_terms( array( 'taxonomy' => 'facility_region', 'hide_empty' => false ) ) as $term ) : ?>
				<option value="<?php echo esc_attr( $term->slug ); ?>" <?php selected( $region, $term->slug ); ?>>
					<?php echo esc_html( $term->name ); ?>
				</option>
			<?php endforeach; ?>
		</select>

		<select name="mf_type">
			<option value="">All Types</option>
			<?php foreach ( get_terms( array( 'taxonomy' => 'facility_type', 'hide_empty' => false ) ) as $term ) : ?>
				<option value="<?php echo esc_attr( $term->slug ); ?>" <?php selected( $type, $term->slug ); ?>>
					<?php echo esc_html( $term->name ); ?>
				</option>
			<?php endforeach; ?>
		</select>

		<button type="submit">Search</button>
	</form>

	<div class="medfinder-results-grid">
		<?php if ( $facilities->have_posts() ) : ?>
			<?php while ( $facilities->have_posts() ) : $facilities->the_post(); ?>
				<div class="medfinder-facility-card">
					<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
					<p><?php echo esc_html( get_field( 'facility_address' ) ); ?></p>
					<p><?php echo esc_html( get_field( 'facility_phone' ) ); ?></p>
					<?php if ( get_field( 'facility_24hr' ) ) : ?>
						<span class="medfinder-badge">Open 24 Hours</span>
					<?php endif; ?>
				</div>
			<?php endwhile; ?>
			<?php wp_reset_postdata(); ?>
		<?php else : ?>
			<p>No facilities found matching your search.</p>
		<?php endif; ?>
	</div>
	<?php
	return ob_get_clean();
}
add_shortcode( 'medfinder_search', 'medfinder_search_shortcode' );
