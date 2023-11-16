<?php

$is_localhost = $_SERVER["REMOTE_ADDR"] == "::1";

if ($is_localhost) {
  $media_dir = realpath(__DIR__ . "/media/2021");
  $media_relative_path = "/media/2021/";
} else {
  $media_dir = realpath(__DIR__ . "/../transit");
  $media_relative_path = "/transit/";
}

function exit_error($error = "", $code = 400)
{
  http_response_code($code);
  echo json_encode(["error" => $error]);
  exit;
}
