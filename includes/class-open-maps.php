<?php

/**
 * The file that defines the core plugin class
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @link       https://www.wplauncher.com
 * @since      1.0.0
 *
 * @package    Open_Maps
 * @subpackage Open_Maps/includes
 */

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      1.0.0
 * @package    Open_Maps
 * @subpackage Open_Maps/includes
 * @author     Ben Shadle <benshadle@gmail.com>
 */
class Open_Maps extends Open_Maps_Templates
{

  private static $instance;

  /**
   * The loader that's responsible for maintaining and registering all hooks that power
   * the plugin.
   *
   * @since    1.0.0
   * @access   protected
   * @var      Open_Maps_Loader    $loader    Maintains and registers all hooks for the plugin.
   */
  protected $loader;

  /**
   * The unique identifier of this plugin.
   *
   * @since    1.0.0
   * @access   protected
   * @var      string    $plugin_name    The string used to uniquely identify this plugin.
   */
  protected static $plugin_name;

  protected $plugin_public;

  protected $plugin_admin;

  /**
   * The current version of the plugin.
   *
   * @since    1.0.0
   * @access   protected
   * @var      string    $version    The current version of the plugin.
   */
  protected static $version;

  /**
   * The plugin data.
   *
   * @since    1.0.0
   * @access   protected
   * @var      object    $plugin data    The plugin data.
   */
  protected static $plugin_data;

  /**
   * Define the core functionality of the plugin.
   *
   * Set the plugin name and the plugin version that can be used throughout the plugin.
   * Load the dependencies, define the locale, and set the hooks for the admin area and
   * the public-facing side of the site.
   *
   * @since    1.0.0
   */
  public function __construct($file)
  {

    self::$plugin_data = $this->get_plugin_data($file);
    self::$version = self::$plugin_data->Version;
    self::$plugin_name = strtolower(self::$plugin_data->Name);
    self::$plugin_name = 'open-maps';

    $this->load_dependencies();
    $this->plugin_admin   = new Open_Maps_Admin();
    $this->plugin_public  = new Open_Maps_Public();
    $this->set_locale();
    $this->define_admin_hooks();
    $this->define_public_hooks();
  }

  private function get_plugin_data($plugin_file)
  {

    $default_headers = array(
      'Test'        => 'Plugin Name',
      'Name'        => 'Plugin Name',
      'PluginURI'   => 'Plugin URI',
      'Version'     => 'Version',
      'Description' => 'Description',
      'Author'      => 'Author',
      'AuthorURI'   => 'Author URI',
      'TextDomain'  => 'Text Domain',
      'DomainPath'  => 'Domain Path',
      'Network'     => 'Network',
      'RequiresWP'  => 'Requires at least',
      'RequiresPHP' => 'Requires PHP',
      'UpdateURI'   => 'Update URI',
    );

    $plugin_data = get_file_data($plugin_file, $default_headers, 'plugin');

    return (object) $plugin_data;
  }

  /**
   * Load the required dependencies for this plugin.
   *
   * Include the following files that make up the plugin:
   *
   * - Open_Maps_Loader. Orchestrates the hooks of the plugin.
   * - Open_Maps_i18n. Defines internationalization functionality.
   * - Open_Maps_Admin. Defines all hooks for the admin area.
   * - Open_Maps_Public. Defines all hooks for the public side of the site.
   *
   * Create an instance of the loader which will be used to register the hooks
   * with WordPress.
   *
   * @since    1.0.0
   * @access   private
   */
  private function load_dependencies()
  {

    /**
     * The class responsible for orchestrating the actions and filters of the
     * core plugin.
     */
    require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-open-maps-loader.php';

    /**
     * The class responsible for defining internationalization functionality
     * of the plugin.
     */
    require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-open-maps-i18n.php';

    /**
     * The class responsible for providing helper utilities
     * of the plugin.
     */
    require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-open-maps-utils.php';

    /**
     * The class responsible for defining all actions that occur in the admin area.
     */
    require_once plugin_dir_path(dirname(__FILE__)) . 'admin/class-open-maps-admin.php';

    /**
     * The class responsible for defining all actions that occur in the public-facing
     * side of the site.
     */
    require_once plugin_dir_path(dirname(__FILE__)) . 'public/class-open-maps-public.php';

    $this->loader = new Open_Maps_Loader();
  }

  /**
   * Define the locale for this plugin for internationalization.
   *
   * Uses the Open_Maps_i18n class in order to set the domain and to register the hook
   * with WordPress.
   *
   * @since    1.0.0
   * @access   private
   */
  private function set_locale()
  {

    $plugin_i18n = new Open_Maps_i18n();

    $this->loader->add_action('plugins_loaded', $plugin_i18n, 'load_plugin_textdomain');
  }

  /**
   * Register all of the hooks related to the admin area functionality
   * of the plugin.
   *
   * @since    1.0.0
   * @access   private
   */
  private function define_admin_hooks()
  {

    $this->loader->add_action('admin_enqueue_scripts', $this->plugin_admin, 'enqueue_styles');
    $this->loader->add_action('admin_enqueue_scripts', $this->plugin_admin, 'enqueue_scripts');
  }

  /**
   * Register all of the hooks related to the public-facing functionality
   * of the plugin.
   *
   * @since    1.0.0
   * @access   private
   */
  private function define_public_hooks()
  {

    $this->loader->add_action('init', $this->plugin_public, 'register_shortcode');
    $this->loader->add_action('wp_enqueue_scripts', $this->plugin_public, 'enqueue_scripts');
    $this->loader->add_action('wp_enqueue_scripts', $this->plugin_public, 'enqueue_styles');
  }

  /**
   * Run the loader to execute all of the hooks with WordPress.
   *
   * @since    1.0.0
   */
  public function run()
  {
    $this->loader->run();
  }

  /**
   * The name of the plugin used to uniquely identify it within the context of
   * WordPress and to define internationalization functionality.
   *
   * @since     1.0.0
   * @return    string    The name of the plugin.
   */
  public function get_plugin_name()
  {
    return self::$plugin_name;
  }

  /**
   * The reference to the class that orchestrates the hooks with the plugin.
   *
   * @since     1.0.0
   * @return    Open_Maps_Loader    Orchestrates the hooks of the plugin.
   */
  public function get_loader()
  {
    return $this->loader;
  }

  /**
   * Retrieve the version number of the plugin.
   *
   * @since     1.0.0
   * @return    string    The version number of the plugin.
   */
  public function get_version()
  {
    return self::$version;
  }

  public static function get_instance($file =  null)
  {
    // If the single instance hasn't been set, set it now.
    if (null == self::$instance) {
      self::$instance = new self($file);
    }
    return self::$instance;
  }
}
