<?php
if (8 < strpos("{$_SERVER['HTTP_REFERER']}", $_SERVER['SERVER_NAME'])) exit;
$z = intval($_GET['z']);
$x = intval($_GET['x']);
$y = intval($_GET['y']);
$r = strip_tags($_GET['r']);
$filter  = isset($_GET['f']) ? $_GET['f'] : false;

function parse_osm_url($url)
{
  global $z, $x, $y;
  $match = preg_match('/{switch:(.*?)}/', $url, $matches);
  if (!$match) {
    $matches = ['', ''];
  }
  $matches = explode(',', $matches[1]);
  $url = preg_replace('/{switch:(.*?)}/', '{s}', $url);
  $url = preg_replace('/{s}/', $matches[array_rand($matches)], $url);
  $url = preg_replace('/{z}/', $z, $url);
  $url = preg_replace('/{x}/', $x, $url);
  $url = preg_replace('/{y}/', $y, $url);
  return $url;
}
function get_file_mod_time($file)
{
  global $max_age;
  return filemtime($file) < time() - $max_age * 30;
}
function is_valid_ressource($url)
{
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_NOBODY, true);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_exec($ch);
  $curl_info = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($curl_info == 200) {
    return true;
  }
  return false;
}
function fetch($url, $dir, $path)
{
  global $ua;
  if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
  }
  $fn = str_ends_with($path, '.png') ? $path : $path . '.png';
  $file = fopen($fn, 'wb');
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_FILE, $file);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_USERAGENT, $ua);
  if (allowed_addresses()) {
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  }
  curl_exec($ch);
  curl_close($ch);
  fflush($file);
  fclose($file);

  // Convert to grayscale image if requested
  global $filter;
  if ($filter) {
    $image = imagecreatefrompng($fn);
    if (image_filter($image)) {
      imagepng($image, $fn);
    }
  }
}
function image_filter($image)
{
  return imagefilter($image, IMG_FILTER_GRAYSCALE);
}
function output_file($file)
{
  set_expiration($file);
  readfile($file);
}
function pass_file_data($url)
{
  global $ua;
  $ctx = stream_context_create(
    array(
      'http' => array(
        'method' => 'GET',
        'user_agent' => $ua,
      ),
    )
  );
  $file = @fopen($url, 'rb', false, $ctx);
  if (!$file) {
    return;
  }
  handle_header($url);
  fpassthru($file);
}
function fetch_header_data($url)
{
  global $ua;
  $data = [];
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_HEADER, true);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_USERAGENT, $ua);
  if (allowed_addresses()) {
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  }
  curl_setopt($ch, CURLOPT_HEADERFUNCTION, function ($handle, $header_data) use (&$data) {
    $data[] = $header_data;
    return strlen($header_data);
  });
  curl_exec($ch);
  curl_close($ch);
  return $data;
}
function allowed_addresses()
{
  $remote_address = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : null;
  return in_array($remote_address, ['127.0.0.1', '::1'], true);
}
function handle_header($url)
{
  global $header;
  $header = fetch_header_data($url);
  send_header($header);
}
function set_expiration($path)
{
  global $max_age;
  $header = array(
    'Expires:'        => gmdate('D, d M Y H:i:s', time() + $max_age * 60) . ' GMT',
    'Last-Modified:'  => gmdate('D, d M Y H:i:s', filemtime($path)) . ' GMT',
    'Cache-Control:'  => 'public, max-age=' . $max_age * 60,
    'Content-Type:'   => 'image/png'
  );
  send_header($header);
}
function send_header(&$header)
{
  foreach ($header as $key => $val) {
    if (is_string($key)) {
      header($key . ' ' . $val);
    } else {
      header($val);
    }
  }
  foreach ($header as $key => $val) {
    header_remove(rtrim($key, ':'));
    header($key . ' ' . $val);
  }
}
$ua = 'Browser-Proxy/0.2';
$res = array(
  'osm' => 'https://{switch:a,b,c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
);
$max_age = 1186400;
$osm_tile_url = parse_osm_url($res[$r]);
$dir = "../tiles/" . $z . "/" . $x;
$filename = $dir . "/" . $y . ".png";
if ($z >= 21) {
  pass_file_data($osm_tile_url);
  exit;
}
if (!is_file($filename) || (get_file_mod_time($filename) && is_valid_ressource($osm_tile_url))) {
  fetch($osm_tile_url, $dir, $filename);
}
output_file($filename);
