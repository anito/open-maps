<?php
$z_coord = intval($_GET['z']);
$x_coord = intval($_GET['x']);
$y_coord = intval($_GET['y']);
$r_coord = strip_tags($_GET['r']);
$filter  = isset($_GET['f']) ? $_GET['f'] : false;

function parse_coord($coord)
{
  global $z_coord, $x_coord, $y_coord;
  $match = preg_match('/{switch:(.*?)}/', $coord, $matches);
  if (!$match) {
    $matches = ['', ''];
  }
  $matches = explode(',', $matches[1]);
  $coord = preg_replace('/{switch:(.*?)}/', '{s}', $coord);
  $coord = preg_replace('/{s}/', $matches[array_rand($matches)], $coord);
  $coord = preg_replace('/{z}/', $z_coord, $coord);
  $coord = preg_replace('/{x}/', $x_coord, $coord);
  $coord = preg_replace('/{y}/', $y_coord, $coord);
  return $coord;
}
function get_image_mod_time($image_file)
{
  global $expires;
  return filemtime($image_file) < time() - ($expires * 30);
}
function is_valid_coord($coord)
{
  $curl_sess = curl_init($coord);
  curl_setopt($curl_sess, CURLOPT_NOBODY, true);
  curl_setopt($curl_sess, CURLOPT_FOLLOWLOCATION, true);
  curl_exec($curl_sess);
  $curl_info = curl_getinfo($curl_sess, CURLINFO_HTTP_CODE);
  curl_close($curl_sess);
  if ($curl_info == 200) {
    return true;
  }
  return false;
}
function serve_image($coord, $image_path, $image_file)
{
  global $ua;
  if (!is_dir($image_path)) {
    mkdir($image_path, 0755, true);
  }
  $fn = $image_file . ".png";
  $file = fopen($fn, 'wb');
  $curl_sess = curl_init($coord);
  curl_setopt($curl_sess, CURLOPT_FILE, $file);
  curl_setopt($curl_sess, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($curl_sess, CURLOPT_HEADER, 0);
  curl_setopt($curl_sess, CURLOPT_USERAGENT, $ua);
  if (allowed_addresses()) {
    curl_setopt($curl_sess, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl_sess, CURLOPT_SSL_VERIFYPEER, false);
  }
  curl_exec($curl_sess);
  curl_close($curl_sess);
  fflush($file);
  fclose($file);
  $image = imagecreatefrompng($fn);
  if ($image) {
    $image = get_image($image, $image_file);
  }
  if ($image && image_filter($image)) {
    imagepng($image, $image_file);
    unlink($fn);
  } else {
    @rename($fn, $image_file);
  }
  imagedestroy($image);
}
function get_image($image, $image_file)
{
  imagejpeg($image, $image_file . ".jpg");
  $image = imagecreatefromjpeg($image_file . ".jpg");
  unlink($image_file . ".jpg");
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
function output_file($image_file)
{
  set_expiration($image_file);
  readfile($image_file);
}
function pass_file_data($coord)
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
  $file = @fopen($coord, 'rb', false, $context);
  if (!$file) {
    return;
  }
  handle_header($coord);
  fpassthru($file);
}
function process_coord($coord)
{
  global $ua;
  $data = [];
  $curl_sess = curl_init();
  curl_setopt($curl_sess, CURLOPT_URL, $coord);
  curl_setopt($curl_sess, CURLOPT_HEADER, true);
  curl_setopt($curl_sess, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($curl_sess, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($curl_sess, CURLOPT_USERAGENT, $ua);
  if (allowed_addresses()) {
    curl_setopt($curl_sess, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl_sess, CURLOPT_SSL_VERIFYPEER, false);
  }
  curl_setopt($curl_sess, CURLOPT_HEADERFUNCTION,    function ($handle, $option) use (&$data) {
    $data[] = $option;
    return strlen($option);
  });
  curl_exec($curl_sess);
  curl_close($curl_sess);
  return $data;
}
function allowed_addresses()
{
  $remote_address = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : null;
  return in_array($remote_address, ['127.0.0.1', '::1'], true);
}
function handle_header($coord)
{
  $header = process_coord($coord);
  set_header($header);
}
function set_expiration($image_file)
{
  global $expires;
  $header = array(
    'Expires:'        => gmdate('D, d M Y H:i:s', time() + $expires * 60) . ' GMT',
    'Last-Modified:'  => gmdate('D, d M Y H:i:s', filemtime($image_file)) . ' GMT',
    'Cache-Control:'  => 'public, max-age=' . ($expires * 60),
    'Content-Type:'   => 'image/png'
  );
  set_header($header);
}
function set_header(&$header)
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
$coords = @$iCZB6hvU1DaJ['servers'] ?: array('osm' => 'https://{switch:a,b,c}.tile.openstreetmap.org/{z}/{x}/{y}.png');
$expires = 1186400;
$header = array('Access-Control-Allow-Origin:' => '*',);
$coord = parse_coord($coords[$r_coord]);
$image_path = "../tiles/" . $z_coord . "/" . $x_coord;
$image_file = $image_path . "/" . $y_coord . ".png";
if ($z_coord >= 21) {
  pass_file_data($coord);
  exit;
}
if (false || !is_file($image_file) || (get_image_mod_time($image_file) && is_valid_coord($coord))) {
  serve_image($coord, $image_path, $image_file);
}
output_file($image_file);
