<?php
$z = intval($_GET['z']);
$x = intval($_GET['x']);
$y = intval($_GET['y']);
$r_coord = strip_tags($_GET['r']);
$filter  = isset($_GET['f']) ? $_GET['f'] : false;

function parse_url($url)
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
  global $expires;
  return filemtime($file) < time() - ($expires * 30);
}
function is_valid_coord($url)
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
function serve_image($url, $dir, $filename)
{
  global $ua;
  if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
  }
  $fn = $filename . '.png';
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
  $image = imagecreatefrompng($fn);
  if ($image) {
    $image = get_image($image, $fn);
  }
  if ($image && image_filter($image)) {
    imagepng($image, $fn);
    unlink($fn);
  } else {
    @rename($fn, $filename);
  }
  if($image) {
    imagedestroy($image);
  }
}
function get_image($image, $fn)
{
  imagejpeg($image, $fn . ".jpg");
  $image = imagecreatefromjpeg($fn . ".jpg");
  unlink($fn . ".jpg");
  return $image;
}
function image_filter($image)
{
  global $filter;
  if ($filter) {
    return imagefilter($image, IMG_FILTER_GRAYSCALE);
  }
  return $image;
}
function output_image($fn)
{
  set_file_headers($fn);
  readfile($fn);
}
function pass_file_data($url)
{
  global $ua;
  $context = stream_context_create(
    array(
      'http' => array(
        'method' => 'GET',
        'user_agent' => $ua,
      ),
    )
  );
  $file = @fopen($url, 'rb', false, $context);
  if (!$file) {
    return;
  }
  handle_header($url);
  fpassthru($file);
}
function start_session($url)
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
  curl_setopt($ch, CURLOPT_HEADERFUNCTION, function ($handle, $option) use (&$data) {
    $data[] = $option;
    return strlen($option);
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
  $header = start_session($url);
  send_header($header);
}
function set_file_headers($file)
{
  global $expires;
  $header = array(
    'Expires:'        => gmdate('D, d M Y H:i:s', time() + $expires * 60) . ' GMT',
    'Last-Modified:'  => gmdate('D, d M Y H:i:s', filemtime($file)) . ' GMT',
    'Cache-Control:'  => 'public, max-age=' . ($expires * 60),
    'Content-Type:'   => 'image/png'
  );
  send_header($header);
}
function send_header(&$header)
{
  global $header;
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
$osm = array('osm' => 'https://{switch:a,b,c}.tile.openstreetmap.org/{z}/{x}/{y}.png');
$osm = @$iCZB6hvU1DaJ['servers'] ?: array('osm' => 'https://{switch:a,b,c}.tile.openstreetmap.org/{z}/{x}/{y}.png');
$url = parse_url($osm[$r_coord]);
$expires = 1186400;
$header = array(
  'Access-Control-Allow-Origin:' => '*',
  'Content-TYpe' => 'image/png'
);
$dir = "../tiles/" . $z . "/" . $x;
$fn = $dir . "/" . $y . ".png";

if ($z >= 21) {
  pass_file_data($url);
  exit;
}
if (!is_file($fn) || (get_file_mod_time($fn) && is_valid_coord($url))) {
  serve_image($url, $dir, $fn);
}
output_image($fn);
