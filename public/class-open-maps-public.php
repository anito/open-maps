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
class Open_Maps_Public
{

  /**
   * The ID of this plugin.
   *
   * @since    1.0.0
   * @access   private
   * @var      string    $plugin_name    The ID of this plugin.
   */
  private $plugin_name;

  /**
   * The version of this plugin.
   *
   * @since    1.0.0
   * @access   private
   * @var      string    $version    The current version of this plugin.
   */
  private $version;

  /**
   * Initialize the class and set its properties.
   *
   * @since    1.0.0
   * @param      string    $plugin_name       The name of the plugin.
   * @param      string    $version    The version of this plugin.
   */
  public function __construct($plugin_name, $version)
  {
    $this->plugin_name = $plugin_name;
    $this->version = $version;
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

    wp_enqueue_style($this->plugin_name . '-map', plugin_dir_url(__FILE__) . 'css/map.css', array(), $this->version, 'all');
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

    $initial_zoomlevel = get_option('open_maps_initial_zoomlevel', 10);
    $latitude = get_option('open_maps_latitude', 13.80656);
    $longitude = get_option('open_maps_longitude', 50.83224000000001);

    wp_enqueue_script($this->plugin_name, plugin_dir_url(__FILE__) . 'js/open-maps-public.js', array('jquery'), $this->version, true);
    wp_enqueue_script($this->plugin_name . '-openstreet', plugin_dir_url(__FILE__) . 'js/map.js', array(), $this->version, true);
    wp_enqueue_script($this->plugin_name . '-openstreet-main', plugin_dir_url(__FILE__) . 'js/m.js', array(), $this->version, true);

    wp_localize_script($this->plugin_name . '-openstreet-main', 'OpenStreetParams', array('initial_zoomlevel' => $initial_zoomlevel, 'latitude' => $latitude, 'longitude' => $longitude));

  }

  function iak($atts)
  {
    $atts = shortcode_atts(array(
      'id' => '1',
    ), $atts, 'iak');

    $daten = "<div tabindex=\"700\" id=\"drdsgvo_map_" . $atts['id'] . "\" class=\"drdsgvo_map\" style=\"height:100%;margin:0;padding:0\"></div>";
    
    return ($daten);
  }

  public function register_shortcode()
  {
    add_shortcode('iak', array($this, 'iak'));
  }
}
