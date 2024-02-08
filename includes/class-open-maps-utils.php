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
class Open_Maps_Utils {

	public function __construct() {}

	/**
	 * Recursivly removes files and the directory itself
	 *
	 * @since     1.0.0
	 * @return    string    The directory to be removed
	 */
	public static function removeDir(string $dir): void
	{
		// Nothing to delete
		if(!is_dir($dir)) {
			return;
		}

		$it = new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS);
		$files = new RecursiveIteratorIterator(
			$it,
			RecursiveIteratorIterator::CHILD_FIRST
		);
		foreach ($files as $file) {
			if ($file->isDir()) {
				rmdir($file->getPathname());
			} else {
				unlink($file->getPathname());
			}
		}
		rmdir($dir);
	}

}