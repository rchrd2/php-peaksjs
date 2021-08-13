<?php
include "../config.php";

$file = $_GET["file"];

if (!isset($file)) {
  exit_error("file must be set");
}

$full_path = $media_dir . '/' . $file;

if (!file_exists($full_path)) {
  exit_error("file does not exist: $full_path");
}

$metadata_path = $full_path . '.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $json = file_get_contents('php://input');

  try {
    $metadata = json_decode($json, true);
  } catch (Exception $e) {
    exit_error("invalid json");
  }

  $fp = fopen($metadata_path, 'w');
  fwrite($fp, json_encode($metadata));
  fclose($fp);
  echo file_get_contents($metadata_path);
} else {
  exit_error("only POST allowed");
}


