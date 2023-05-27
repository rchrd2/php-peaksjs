<?php
include "../config.php";

$id = 0;
function add_ids(&$md)
{
  if (isset($md["points"])) {
    foreach ($md["points"] as &$point) {
      if (!isset($point["id"])) {
        $point["id"] = "$id";
        $id++;
      }
    }
  }
}

function md_to_lookup($md)
{
  $lookup = [];
  if (isset($md["points"])) {
    foreach ($md["points"] as &$point) {
      if (isset($point["id"])) {
        $lookup[$point["id"]] = $point;
      }
    }
  }
  return $lookup;
}

function merge_metadata($old_md, $new_md)
{
  add_ids($old_md);
  $old_md_lookup = md_to_lookup($old_md);
  foreach ($new_md["points"] as $point) {
    if (isset($point["id"])) {
      if (!isset($old_md_lookup[$point["id"]])) {
        if (!isset($old_md["points"])) {
          $old_md["points"] = [];
        }
        array_push($old_md["points"], $point);
      }
      // TODO handle edits..
    }
  }
  return $old_md;
}

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
  $request_json = file_get_contents('php://input');

  try {
    $request_data = json_decode($request_json, true);
  } catch (Exception $e) {
    exit_error("invalid json");
  }

  if (array_key_exists("delete_id", $_GET)) {
    $delete_id = $_GET["delete_id"];
    $current_md = json_decode(file_get_contents($metadata_path), true);
    $new_points = [];
    foreach ($current_md["points"] as $point) {
      if ($point["id"] != $delete_id) {
        array_push($new_points, $point);
      }
    }
    $current_md["points"] = $new_points;
    $fp = fopen($metadata_path, 'w');
    fwrite($fp, json_encode($current_md, JSON_PRETTY_PRINT));
    fclose($fp);
  } else {
    $current_md = json_decode(file_get_contents($metadata_path), true);
    $merged_md = merge_metadata($current_md, $request_data);
    $fp = fopen($metadata_path, 'w');
    fwrite($fp, json_encode($merged_md, JSON_PRETTY_PRINT));
    fclose($fp);
  }
  echo file_get_contents($metadata_path);
} else {
  exit_error("only POST allowed");
}
