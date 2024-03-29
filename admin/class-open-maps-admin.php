<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://www.wplauncher.com
 * @since      1.0.0
 *
 * @package    Open_Maps
 * @subpackage Open_Maps/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Open_Maps
 * @subpackage Open_Maps/admin
 * @author     Ben Shadle <benshadle@gmail.com>
 */
class Open_Maps_Admin
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
   * @param      string    $plugin_name       The name of this plugin.
   * @param      string    $version    The version of this plugin.
   */
  public function __construct($plugin_name, $version)
  {

    $this->plugin_name = $plugin_name;
    $this->version = $version;

    add_action('admin_menu', array($this, 'addPluginAdminMenu'), 9);
    add_action('admin_init', array($this, 'registerAndBuildFields'));
    add_action('option', array($this, 'registerAndBuildFields'));
    add_action('update_option_open_maps_grayscale', array($this, 'open_maps_grayscale_callback'), 10, 2);
  }

  /**
   * Remove tiles directory including its content in order to fetch fresh map tiles
   */
  public function open_maps_grayscale_callback($old, $new)
  {

    $dir = plugin_dir_path(__DIR__) . 'tiles';
    Open_Maps_Utils::removeDir($dir);
  }

  /**
   * Register the stylesheets for the admin area.
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

    wp_enqueue_style($this->plugin_name, plugin_dir_url(__FILE__) . 'css/open-maps-admin.css', array(), $this->version, 'all');
  }

  /**
   * Register the JavaScript for the admin area.
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

    wp_enqueue_script($this->plugin_name, plugin_dir_url(__FILE__) . 'js/open-maps-admin.js', array('jquery'), $this->version, false);
  }

  public function addPluginAdminMenu()
  {
    //add_menu_page( $page_title, $menu_title, $capability, $menu_slug, $function, $icon_url, $position );
    add_menu_page(__('Open Street Maps', 'open-maps'), __('Open Street Maps', 'open-maps'), 'administrator', $this->plugin_name, array($this, 'displayPluginAdminSettings'), 'dashicons-location-alt', 26);

    //add_submenu_page( '$parent_slug, $page_title, $menu_title, $capability, $menu_slug, $function );
    // add_submenu_page($this->plugin_name, 'Open Maps Settings', __('Settings', 'open-maps'), 'administrator', $this->plugin_name . '-settings', array($this, 'displayPluginAdminSettings'));
  }

  public function displayPluginAdminDashboard()
  {
    require_once 'partials/' . $this->plugin_name . '-admin-display.php';
  }

  public function displayPluginAdminSettings()
  {
    // set this var to be used in the settings-display view
    $active_tab = isset($_GET['tab']) ? $_GET['tab'] : 'general';
    if (isset($_GET['error_message'])) {
      add_action('admin_notices', array($this, 'settingsPageSettingsMessages'));
      do_action('admin_notices', $_GET['error_message']);
    }
    require_once 'partials/' . $this->plugin_name . '-admin-settings-display.php';
  }

  public function settingsPageSettingsMessages($error_message)
  {
    switch ($error_message) {
      case '1':
        $message = __('There was an error adding this setting. Please try again.  If this persists, shoot us an email.', 'my-text-domain');
        $err_code = esc_attr('open_maps_ini_zoom');
        $setting_field = 'open_maps_ini_zoom';
        break;
    }
    $type = 'error';
    add_settings_error(
      $setting_field,
      $err_code,
      $message,
      $type
    );
  }

  public function registerAndBuildFields()
  {
    $register = function ($id) {
      register_setting(
        'open_maps_general_settings',
        $id,
      );
    };

    /**
     * First, we add_settings_section. This is necessary since all future settings must belong to one.
     * Second, add_settings_field
     * Third, register_setting
     */
    add_settings_section(
      'open_maps_general_section', // ID used to identify this section and with which to register options
      __('General settings', 'open-maps'), // Title
      array($this, 'open_maps_display_general_account'), // Callback
      'open_maps_general_settings' // Page on which to add this section of options
    );

    // Latitude
    $args = array(
      'type'              => 'input',
      'subtype'           => 'text',
      'id'                => 'open_maps_latitude',
      'name'              => 'open_maps_latitude',
      'required'          => 'required="required"',
      'get_options_list'  => '',
      'value_type'        => 'normal',
      'wp_data'           => 'option'
    );

    add_settings_field(
      $args['id'],
      __('Latitude', 'open-maps'),
      array($this, 'open_maps_render_settings_field'),
      'open_maps_general_settings',
      'open_maps_general_section',
      $args
    );
    $register($args['id']);

    // Longitude
    unset($args);
    $args = array(
      'type'              => 'input',
      'subtype'           => 'text',
      'id'                => 'open_maps_longitude',
      'name'              => 'open_maps_longitude',
      'required'          => 'required="required"',
      'get_options_list'  => '',
      'value_type'        => 'normal',
      'wp_data'           => 'option'
    );

    add_settings_field(
      $args['id'],
      __('Longitude', 'open-maps'),
      array($this, 'open_maps_render_settings_field'),
      'open_maps_general_settings',
      'open_maps_general_section',
      $args
    );
    $register($args['id']);

    // Zoomlevel
    unset($args);
    $args = array(
      'type'              => 'input',
      'subtype'           => 'number',
      'min'               => 1,
      'max'               => DEFAULT_MAX_ZOOM - DEFAULT_MIN_ZOOM,
      'placeholder'       => DEFAULT_INI_ZOOM,
      'id'                => 'open_maps_ini_zoom',
      'name'              => 'open_maps_ini_zoom',
      'get_options_list'  => '',
      'value_type'        => 'normal',
      'wp_data'           => 'option',
      'label'             => sprintf(__('[%d - %d]', 'open-maps'), 1, DEFAULT_MAX_ZOOM - DEFAULT_MIN_ZOOM),
    );
    add_settings_field(
      $args['id'],
      __('Zoomlevel', 'open-maps'),
      array($this, 'open_maps_render_settings_field'),
      'open_maps_general_settings',
      'open_maps_general_section',
      $args
    );
    $register($args['id']);

    // Min Zoom
    // unset($args);
    // $args = array(
    //   'type'              => 'input',
    //   'subtype'           => 'number',
    //   'min'               => DEFAULT_MIN_ZOOM,
    //   'max'               => DEFAULT_MAX_ZOOM,
    //   'placeholder'       => DEFAULT_MIN_ZOOM,
    //   'id'                => 'open_maps_min_zoom',
    //   'name'              => 'open_maps_min_zoom',
    //   'get_options_list'  => '',
    //   'value_type'        => 'normal',
    //   'wp_data'           => 'option'
    // );
    // add_settings_field(
    //   $args['id'],
    //   __('Min. Zoom', 'open-maps'),
    //   array($this, 'open_maps_render_settings_field'),
    //   'open_maps_general_settings',
    //   'open_maps_general_section',
    //   $args
    // );
    // $register($args['id']);

    // Max Zoom
    // unset($args);
    // $args = array(
    //   'type'              => 'input',
    //   'subtype'           => 'number',
    //   'min'               => DEFAULT_MIN_ZOOM,
    //   'max'               => DEFAULT_MAX_ZOOM,
    //   'placeholder'       => DEFAULT_MAX_ZOOM,
    //   'id'                => 'open_maps_max_zoom',
    //   'name'              => 'open_maps_max_zoom',
    //   'get_options_list'  => '',
    //   'value_type'        => 'normal',
    //   'wp_data'           => 'option'
    // );
    // add_settings_field(
    //   $args['id'],
    //   __('Max. Zoom', 'open-maps'),
    //   array($this, 'open_maps_render_settings_field'),
    //   'open_maps_general_settings',
    //   'open_maps_general_section',
    //   $args
    // );
    // $register($args['id']);

    // Grayscale Filter
    unset($args);
    $args = array(
      'type'      => 'input',
      'subtype'   => 'checkbox',
      'id'    => 'open_maps_grayscale',
      'name'      => 'open_maps_grayscale',
      'get_options_list' => '',
      'value_type' => 'normal',
      'wp_data' => 'option'
    );
    add_settings_field(
      $args['id'],
      __('Grayscale', 'open-maps'),
      array($this, 'open_maps_render_settings_field'),
      'open_maps_general_settings',
      'open_maps_general_section',
      $args
    );
    $register($args['id']);
  }

  public function open_maps_display_general_account()
  {
    echo '<p>' . __('Geographical coordinates and view settings', 'open-maps') . '</p>';
  }

  public function open_maps_render_settings_field($args)
  {
    /**
     * EXAMPLE INPUT
     * 'type'             => 'input',
     * 'subtype'          => '',
     * 'id'               => $this->plugin_name.'_example_setting',
     * 'name'             => $this->plugin_name.'_example_setting',
     * 'required'         => 'required="required"',
     * 'get_option_list'  => "",
     * 'value_type' = serialized OR normal,
     * 'wp_data'=>(option or post_meta),
     * 'post_id' =>
     */
    if ($args['wp_data'] == 'option') {
      $wp_data_value = get_option($args['name']);
    } elseif ($args['wp_data'] == 'post_meta') {
      $wp_data_value = get_post_meta($args['post_id'], $args['name'], true);
    }

    switch ($args['type']) {

      case 'input':
        $value = ($args['value_type'] == 'serialized') ? serialize($wp_data_value) : $wp_data_value;
        $required = (isset($args['required'])) ? $args['required'] : '';
        if ($args['subtype'] != 'checkbox') {
          $prependStart = (isset($args['prepend_value'])) ? '<div class="input-prepend"> <span class="add-on">' . $args['prepend_value'] . '</span>' : '';
          $prependEnd = (isset($args['prepend_value'])) ? '</div>' : '';
          $step = (isset($args['step'])) ? 'step="' . $args['step'] . '"' : '';
          $min = (isset($args['min'])) ? 'min="' . $args['min'] . '"' : '';
          $max = (isset($args['max'])) ? 'max="' . $args['max'] . '"' : '';
          $placeholder = (isset($args['placeholder'])) ? 'placeholder="' . $args['placeholder'] . '"' : '';
          if (isset($args['disabled'])) {
            // hide the actual input bc if it was just a disabled input the info saved in the database would be wrong - bc it would pass empty values and wipe the actual information
            echo $prependStart . '<input type="' . $args['subtype'] . '" ' . $placeholder . ' id="' . $args['id'] . '_disabled" ' . $step . ' ' . $max . ' ' . $min . ' name="' . $args['name'] . '_disabled" size="40" disabled value="' . esc_attr($value) . '" /><input type="hidden" id="' . $args['id'] . '" ' . $step . ' ' . $max . ' ' . $min . ' name="' . $args['name'] . '" size="40" value="' . esc_attr($value) . '" />' . $prependEnd;
          } else {
            echo $prependStart . '<input type="' . $args['subtype'] . '" ' . $placeholder . ' id="' . $args['id'] . '"' . $required . $step . ' ' . $max . ' ' . $min . ' name="' . $args['name'] . '" size="40" value="' . esc_attr($value) . '" />' . $prependEnd;
          }
          /*<input required="required" '.$disabled.' type="number" step="any" id="'.$this->plugin_name.'_cost2" name="'.$this->plugin_name.'_cost2" value="' . esc_attr( $cost ) . '" size="25" /><input type="hidden" id="'.$this->plugin_name.'_cost" step="any" name="'.$this->plugin_name.'_cost" value="' . esc_attr( $cost ) . '" />*/
        } else {
          $checked = ($value) ? 'checked' : '';
          echo '<input type="' . $args['subtype'] . '" id="' . $args['id'] . '"' . $required . ' name="' . $args['name'] . '" size="40" value="1" ' . $checked . ' />';
        }
        break;
      default:
        # code...
        break;
    }

    if (isset($args['label'])) {
      echo '<label for="' . $args['id'] . '" class="description">&nbsp;' . $args['label'] . '</label>';
    }
    if (isset($args['description'])) {
      echo '<p class="description">' . $args['description'] . '</p>';
    }
  }
}
