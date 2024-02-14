<?php

// If this file is called directly, abort.
if (!defined('WPINC')) {
  die();
}

// If class `Kleinanzeigen_Templates` doesn't exists yet.
if (!class_exists('Open_Maps_Templates')) {


  class Open_Maps_Templates
  {

    private static $instance = null;
    protected $plugin_path;
    protected $plugin_url;

    public function __construct()
    {

      $this->register();
    }

    public function register()
    {
      
    }

    public function include_template($path, $return_instead_of_echo = false, $extract_these = array())
    {
      if ($return_instead_of_echo) ob_start();

      $template_file = $this->get_template($path);

      if (!file_exists($template_file)) {
        error_log("Template not found: " . $template_file);
        echo __('Error:', 'open-maps') . ' ' . __('Template not found', 'open-maps') . " (" . $path . ")";
      } else {
        extract($extract_these);
        include $template_file;
      }

      if ($return_instead_of_echo) return ob_get_clean();
    }

    public function plugin_path($path = null)
    {

      if (!$this->plugin_path) {
        $this->plugin_path = trailingslashit(dirname(__FILE__, 2));
      }

      return $this->plugin_path . $path;
    }

    private function get_template($name = null)
    {

      $template = $this->template_path() . 'partials/' . $name;
      return $this->plugin_path($template);
    }

    private function template_path()
    {

      return apply_filters('open-maps/template-path', null);
    }

    public static function get_instance()
    {
      // If the single instance hasn't been set, set it now.
      if (null == self::$instance) {
        self::$instance = new self;
      }
      return self::$instance;
    }
  }
}

Kleinanzeigen_Templates::get_instance();