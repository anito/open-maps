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
class Open_Maps_Admin extends Open_Maps
{

  /**
   * Initialize the class and set its properties.
   *
   * @since    1.0.0
   */
  public function __construct()
  {

    add_action('admin_menu', array($this, 'addPluginAdminMenu'), 9);
    add_action('admin_init', array($this, 'loadFiles'));
    add_action('admin_footer', array($this, 'add_admin_footer_template'));
    add_action('admin_init', array($this, 'registerAndBuildFields'));
    add_action('option', array($this, 'registerAndBuildFields'));
    add_action('update_option_open_maps_grayscale', array($this, 'open_maps_grayscale_callback'), 10, 0);
    add_filter('option_open_maps_coords', array($this, 'open_maps_coords_callback'));
    add_filter('open-maps/template-path', array($this, 'template_path'));
  }

  public function loadFiles()
  {
    require_once $this->plugin_path('includes/class-open-maps-templates.php');
  }

  public function open_maps_coords_callback($value)
  {

    foreach ($value as $key => $val) {

      if (empty($val['lat']) || empty($val['lon'])) {
        unset($value[$key]);
        continue;
      }
      if (is_numeric($val['lat'])) {
        $value[$key]['lat'] = (float) $val['lat'];
      }
      if (is_numeric($val['lon'])) {
        $value[$key]['lon'] = (float) $val['lon'];
      }
    }
    return $value;
  }

  /**
   * Remove tiles directory including its content in order to fetch fresh map tiles
   */
  public function open_maps_grayscale_callback()
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

    wp_enqueue_style(self::$plugin_name, plugin_dir_url(__FILE__) . 'css/open-maps-admin.css', array(), self::$version, 'all');
    wp_enqueue_style(self::$plugin_name . '-open-maps', plugin_dir_url(__DIR__) . 'assets/css/map.css', array(), self::$version, 'all');
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

    $coords            = get_option('open_maps_coords');
    $filter            = get_option('open_maps_grayscale');
    $ini_zoom          = (int) !empty($ini_zoom = get_option('open_maps_ini_zoom')) ? $ini_zoom : DEFAULT_INI_ZOOM;
    $min_zoom          = DEFAULT_MIN_ZOOM;
    $max_zoom          = DEFAULT_MAX_ZOOM;

    wp_enqueue_script(self::$plugin_name . '-open-maps', plugin_dir_url(__DIR__) . 'assets/js/map.js', array(), self::$version, true);
    wp_enqueue_script(self::$plugin_name . '-open-maps-main', plugin_dir_url(__DIR__) . 'assets/js/m.js', array(), self::$version, true);
    wp_localize_script(self::$plugin_name . '-open-maps-main', 'OpenStreetParams', array(
      'coords'    => $coords,
      'ini_zoom'  => $ini_zoom,
      'min_zoom'  => $min_zoom,
      'max_zoom'  => $max_zoom,
      'filter'    => $filter,
    ));
    wp_enqueue_script(self::$plugin_name . '-admin', plugin_dir_url(__FILE__) . 'js/open-maps-admin.js', array('jquery'), self::$version, false);
    wp_localize_script(self::$plugin_name . '-admin', 'OpenStreetAdminParams', array());
  }

  public function addPluginAdminMenu()
  {
    //add_menu_page( $page_title, $menu_title, $capability, $menu_slug, $function, $icon_url, $position );
    add_menu_page(__('Open Street Maps', 'open-maps'), __('Open Street Maps', 'open-maps'), 'administrator', self::$plugin_name, array($this, 'displayPluginAdminSettings'), 'dashicons-location-alt', 26);

    //add_submenu_page( '$parent_slug, $page_title, $menu_title, $capability, $menu_slug, $function );
    // add_submenu_page(self::$plugin_name, 'Open Maps Settings', __('Settings', 'open-maps'), 'administrator', self::$plugin_name . '-settings', array($this, 'displayPluginAdminSettings'));
  }

  public function template_path($path = '')
  {
    return trailingslashit('admin') . $path;
  }

  public function displayPluginAdminDashboard()
  {
    require_once 'partials/' . self::$plugin_name . '-admin-display.php';
  }

  public function displayPluginAdminSettings()
  {
    // set this var to be used in the settings-display view
    $active_tab = isset($_GET['tab']) ? $_GET['tab'] : 'general';
    if (isset($_GET['error_message'])) {
      add_action('admin_notices', array($this, 'settingsPageSettingsMessages'));
      do_action('admin_notices', $_GET['error_message']);
    }
    require_once 'partials/' . self::$plugin_name . '-admin-settings-display.php';
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

    // Coordinates
    unset($args);
    $args = array(
      'type'              => 'input',
      'subtype'           => array('text', 'text', 'text'),
      'id'                => 'open_maps_coords',
      'name'              => 'open_maps_coords',
      'placeholder'       => array(__('Latitude', 'open-maps'), __('Longitude', 'open-maps'), __('Label', 'open-maps')),
      'get_options_list'  => '',
      'value_type'        => 'normal',
      'wp_data'           => 'option',
    );
    add_settings_field(
      $args['id'],
      __('Coordinates and label', 'open-maps'),
      array($this, 'open_maps_render_coords'),
      'open_maps_general_settings',
      'open_maps_general_section',
      $args
    );
    $register($args['id']);

    // Zoomlevel
    unset($args);
    $args = array(
      'type'              => 'input',
      'subtype'           => array('number', 'size' => 3),
      'min'               => DEFAULT_MIN_ZOOM,
      'max'               => DEFAULT_MAX_ZOOM,
      'placeholder'       => DEFAULT_INI_ZOOM,
      'id'                => 'open_maps_ini_zoom',
      'name'              => 'open_maps_ini_zoom',
      'get_options_list'  => '',
      'value_type'        => 'normal',
      'wp_data'           => 'option',
      'label'             => sprintf(__('[%d - %d]', 'open-maps'), DEFAULT_MIN_ZOOM, DEFAULT_MAX_ZOOM),
    );
    add_settings_field(
      $args['id'],
      __('Default zoomlevel', 'open-maps'),
      array($this, 'open_maps_render_settings_field'),
      'open_maps_general_settings',
      'open_maps_general_section',
      $args
    );
    $register($args['id']);

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

    add_settings_section(
      'open_maps_preview_section', // ID used to identify this section and with which to register options
      __('Preview', 'open-maps'), // Title
      array($this, 'open_maps_display_preview'), // Callback
      'open_maps_general_settings' // Page on which to add this section of options
    );

    // Shortcode
    unset($args);
    $args = array(
      'type'              => 'input',
      'subtype'           => array('text', 'size' => 20),
      'id'                => 'open_maps_shortcode',
      'name'              => 'open_maps_shortcode',
      'placeholder'       => htmlspecialchars(IAK_PLACEHOLDER),
      'get_options_list'  => '',
      'value_type'        => 'normal',
      'wp_data'           => 'option',
    );
    add_settings_field(
      $args['id'],
      __('Shortcode', 'open-maps'),
      array($this, 'open_maps_render_preview'),
      'open_maps_general_settings',
      'open_maps_preview_section',
      $args
    );
    $register($args['id']);
  }

  public function open_maps_display_general_account()
  {
    echo '<p>' . __('Geographical coordinates and view settings', 'open-maps') . '</p>';
  }

  public function open_maps_display_preview()
  {
    echo '<div>';
    echo '<p>' . __('Use the shortcode field below to generate a preview from your shortcode', 'open-maps') . '</p>';
    echo '</div>';
  }

  public function open_maps_render_coords($args)
  {

    $args['classes'] = array('open-maps-coords-group', 'group');
    $values = get_option($args['name']);
    if (!$values) {
      unset($values);
      // Upgrade form previous (single coord) installation
      $values[0]['lat'] = get_option('open_maps_latitude');
      $values[0]['lon'] = get_option('open_maps_longitude');
      $values[0]['lab'] = '';
      add_option($args['name'], $values);
      $this->open_maps_grayscale_callback();
      $redirect = (empty($_SERVER['HTTPS']) ? 'http' : 'https') . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
      wp_redirect($redirect);
    }

    echo '<div class="open-maps-coords-groups">';
    foreach ($values as $key => $val) {
      $args['id'] = $args['classes'][0] . '-' . $key;
      $this->include_template('coords-group.php', false, compact('args', 'key', 'val'));
    }
    echo '</div>';
  }

  public function add_admin_footer_template()
  {
    $val['lat'] = '';
    $val['lon'] = '';
    $val['lab'] = '';
    $args['name'] = 'open_maps_coords';
    $args['subtype'] = array('text', 'text', 'text');
    $args['placeholder'] = array(__('Latitude', 'open-maps'), __('Longitude', 'open-maps'), __('Label', 'open-maps'));
    $args['classes'] = array('open-maps-coords-group', 'group', 'template');
    $args['id'] = $args['classes'][0] . '-template';
    $key = 'template';
    $template = $this->include_template('coords-group.php', false, compact('args', 'key', 'val'));
  }

  public function open_maps_render_settings_field($args)
  {
    /**
     * EXAMPLE INPUT
     * 'type'             => 'input',
     * 'subtype'          => '',
     * 'id'               => self::$plugin_name.'_example_setting',
     * 'name'             => self::$plugin_name.'_example_setting',
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
          $size = is_array($args['subtype']) && array_key_exists('size', $args['subtype']) ? $args['subtype']['size'] : 40;
          $subtype = !is_array($args['subtype']) ? $args['subtype'] : 'text';
          if (isset($args['disabled'])) {
            // hide the actual input bc if it was just a disabled input the info saved in the database would be wrong - bc it would pass empty values and wipe the actual information
            echo $prependStart . '<input type="' . $subtype . '" ' . $placeholder . ' id="' . $args['id'] . '_disabled" ' . $step . ' ' . $max . ' ' . $min . ' name="' . $args['name'] . '_disabled" size="' . $size . '" disabled value="' . esc_attr($value) . '" /><input type="hidden" id="' . $args['id'] . '" ' . $step . ' ' . $max . ' ' . $min . ' name="' . $args['name'] . '" size="40" value="' . esc_attr($value) . '" />' . $prependEnd;
          } else {
            echo $prependStart . '<input type="' . $subtype . '" ' . $placeholder . ' id="' . $args['id'] . '"' . $required . $step . ' ' . $max . ' ' . $min . ' name="' . $args['name'] . '" size="' . $size . '" value="' . esc_attr($value) . '" />' . $prependEnd;
          }
          /*<input required="required" '.$disabled.' type="number" step="any" id="'.self::$plugin_name.'_cost2" name="'.self::$plugin_name.'_cost2" value="' . esc_attr( $cost ) . '" size="25" /><input type="hidden" id="'.self::$plugin_name.'_cost" step="any" name="'.self::$plugin_name.'_cost" value="' . esc_attr( $cost ) . '" />*/
        } else {
          $checked = ($value) ? 'checked' : '';
          echo '<input type="' . $args['subtype'] . '" id="' . $args['id'] . '"' . $required . ' name="' . $args['name'] . '" value="1" ' . $checked . ' />';
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

  public function open_maps_render_preview($args)
  {
    $this->open_maps_render_settings_field($args);
    $shortcode = !empty($sc = get_option('open_maps_shortcode')) ? $sc : IAK_PLACEHOLDER;
    echo do_shortcode($this->include_template('preview.php', true, compact('shortcode')));
    echo '<div class="open-maps-field-description">';
    echo '<div>' . __('Usage with parameters:', 'open-maps') . '</div>';
    echo '<ul>';
    echo '<li><b>zoom: </b>' . __('use the "zoom" parameter in order to override default zoom', 'open-maps') . '</li>';
    echo '<li><b>id:  </b>' . __('use an "id" parameter in order to differentiate multiple maps on the same page', 'open-maps') . '</li>';
    echo '</ul>';
    echo '</div>';
    echo '<p style="opacity: .8;"><i><small>' . __('Example:', 'open-maps') . '</i>&nbsp;<span class="code">[iak id="2" zoom="12.3"]</span>' . '</small></i></p>';

  }
}
