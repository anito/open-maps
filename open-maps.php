<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://www.wplauncher.com
 * @since             1.0.0
 * @package           Open_Maps
 *
 * @wordpress-plugin
 * Plugin Name:       Open Street Map
 * Plugin URI:        https://www.wplauncher.com
 * Description:       Interactive Map Substitude for Google Maps
 * Version:           1.0.8
 * Author:            Axel Nitzschner
 * Author URI:        https://www.webpremiere.de
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       open-maps
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( 'OPEN_MAPS_VERSION', '1.0.8' );
define( 'DEFAULT_INI_ZOOM', 1 );
define( 'DEFAULT_MIN_ZOOM', 9 );
define( 'DEFAULT_MAX_ZOOM', 18 );

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-open-maps-activator.php
 */
function activate_open_maps() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-open-maps-activator.php';
	Open_Maps_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-open-maps-deactivator.php
 */
function deactivate_open_maps() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-open-maps-deactivator.php';
	Open_Maps_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_open_maps' );
register_deactivation_hook( __FILE__, 'deactivate_open_maps' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-open-maps.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_open_maps() {

	$plugin = new Open_Maps();
	$plugin->run();

}
run_open_maps();
