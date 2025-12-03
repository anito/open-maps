<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://www.wplauncher.com
 * @since      1.0.0
 *
 * @package    Open_Maps
 * @subpackage Open_Maps/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Open_Maps
 * @subpackage Open_Maps/public
 * @author     Ben Shadle <benshadle@gmail.com>
 */
class Open_Maps_Public extends Open_Maps
{

  /**
   * Initialize the class and set its properties.
   *
   * @since    1.0.0
   */
  public function __construct()
  {
  }

  /**
   * Register the stylesheets for the public-facing side of the site.
   *
   * @since    1.0.0
   */
  public function enqueue_styles()
  {

    /**
     * This function is provided for demonstration purposes only.
     *
     * An instance of this class should be passed to the run() function
     * defined in Open_Maps_Loader as all of the hooks are defined
     * in that particular class.
     *
     * The Open_Maps_Loader will then create the relationship
     * between the defined hooks and the functions defined in this
     * class.
     */

    wp_enqueue_style(self::$plugin_name . '-map', plugin_dir_url(__DIR__) . 'assets/css/map.css', array(), self::$version, 'all');
  }

  /**
   * Register the JavaScript for the public-facing side of the site.
   *
   * @since    1.0.0
   */
  public function enqueue_scripts()
  {
    /**
     * This function is provided for demonstration purposes only.
     *
     * An instance of this class should be passed to the run() function
     * defined in Open_Maps_Loader as all of the hooks are defined
     * in that particular class.
     *
     * The Open_Maps_Loader will then create the relationship
     * between the defined hooks and the functions defined in this
     * class.
     */

    $coords            = get_option('open_maps_coords');
    $filter            = get_option('open_maps_grayscale');
    $marker            = (!empty($image_id = get_option('open_maps_marker'))) ? wp_get_attachment_image_url($image_id, 'full') : false;
    $min_zoom          = DEFAULT_MIN_ZOOM;
    $max_zoom          = DEFAULT_MAX_ZOOM;

    wp_enqueue_script(self::$plugin_name . '-open-maps', plugin_dir_url(__DIR__) . 'assets/js/map.js', array(), self::$version, true);
    wp_enqueue_script(self::$plugin_name . '-open-maps-main', plugin_dir_url(__DIR__) . 'assets/js/m.js', array(), self::$version, true);
    wp_localize_script(self::$plugin_name . '-open-maps-main', 'OpenStreetParams', array(
      'coords'    => $coords,
      'min_zoom'  => $min_zoom,
      'max_zoom'  => $max_zoom,
      'marker'    => $marker,
      'filter'    => $filter,
    ));
    
    wp_enqueue_script(self::$plugin_name . '-open-maps-public', plugin_dir_url(__FILE__) . 'js/open-maps-public.js', array('jquery'), self::$version, true);

  }

  function iak($atts)
  {;
    $atts = shortcode_atts(array(
      'id'      => '1',
      'zoom'    => !empty($ini_zoom = get_option('open_maps_ini_zoom')) ? $ini_zoom : DEFAULT_INI_ZOOM,
      'points'  => ''
    ), $atts, 'iak');

    return '<div tabindex="700" id="ol-map-' . $atts["id"] . '" data-id="' . $atts['id'] . '" data-zoom="' . $atts["zoom"] . '"' . (!empty($atts["points"]) ? ' data-points="' . preg_replace('/\s/', '', $atts["points"]) . '"' : '') . ' class="ol-map" style="height: 100%; margin: 0; padding: 0;"></div>';
  }

  public function register_shortcode()
  {
    add_shortcode('iak', array($this, 'iak'));
  }
}
