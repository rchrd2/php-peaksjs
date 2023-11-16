<?php
include "../config.php";


$file = $_GET["file"];

if (!isset($file)) {
  exit_error("file must be set");
}

$full_path = $media_dir . '/' . $file;

if (!file_exists($full_path)) {
  echo '{}';
  exit;
}

$metadata_path = $full_path . '.json';

if (!file_exists($metadata_path)) {
  echo '{}';
  exit;
}

echo file_get_contents($metadata_path);


// <!-- {
//   "segments": [
//     {
//       "startTime": 120,
//       "endTime": 140,
//       "editable": true,
//       "color": "#ff0000",
//       "labelText": "My label"
//     },
//     {
//       "startTime": 220,
//       "endTime": 240,
//       "editable": false,
//       "color": "#00ff00",
//       "labelText": "My Second label"
//     }
//   ],
//   "points": [
//     {
//       "time": 150,
//       "editable": true,
//       "color": "#00ff00",
//       "labelText": "A point"
//     },
//     {
//       "time": 160,
//       "editable": true,
//       "color": "#00ff00",
//       "labelText": "Another point"
//     }
//   ]
// } -->