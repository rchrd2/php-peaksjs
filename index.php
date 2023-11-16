<?php
// php -S localhost:8000
include "config.php";

if (!isset($_GET["file"])) {

?>
  <h1>Index of <?= $media_dir ?></h1>
  <hr />
<?php

  function iterateDirectory($i)
  {
    global $media_dir;
    echo '<ul>';
    foreach ($i as $path) {
      if ($path->isDir()) {
        iterateDirectory($path);
      } else {
        if (file_exists("$path.dat")) {
          $relative_path = str_replace($media_dir, "", $path);
          // echo $media_dir . "<BR>";
          // echo $path . "<BR>";
          // echo $relative_path . "<BR>";
          echo "<li><a href='?file=" . urlencode($relative_path) . "'>$relative_path</a></li>";
        }
      }
    }
    echo '</ul>';
  }
  $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($media_dir));
  iterateDirectory($iterator);

  exit;
}
?>

<!-- <a href="?">Home</a> -->

<?php

$file = $_GET["file"];
$file_web_path = $media_relative_path . trim($file, '/');
$wf_dat_file = "$file_web_path.dat";
$wf_json_file = "$file_web_path.json";

?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title><?= $file ?></title>
  <link rel="stylesheet" href="main.css" />
</head>

<body>
  <div id="waveform-container">
    <div id="overview-container"></div>
    <div id="zoomview-container"></div>
  </div>
  <div class="container">

    <div id="demo-controls">
      <audio id="audio" controls="controls">
        <source src="<?= $file_web_path ?>" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>

      <div id="controls">
        <button class="" data-action="zoom-in">Zoom in</button>
        <button class="" data-action="zoom-out">Zoom out</button>
        <button class="hide" data-action="log-data">Log segments/points</button>
        <input class="hide" type="text" id="seek-time" value="15.0">
        <button class="hide" data-action="seek">Seek</button>
        <label class="hide" for="amplitude-scale">Amplitude scale</label>
        <input class="hide" type="range" id="amplitude-scale" min="0" max="10" step="1">
        <input class="hide" type="checkbox" id="auto-scroll" checked>
        <label class="hide" for="auto-scroll">Auto-scroll</label>
        <button class="hide" data-action="resize">Resize</button>
        <button class="hide" data-action="toggle-zoomview">Show/hide zoomable waveform</button>
        <button class="hide" data-action="toggle-overview">Show/hide overview waveform</button>
        <button class="hide" data-action="destroy">Destroy</button>
        <button class="hide" data-action="save">Save</button>
        <button class="" data-action="seek-minus15">-15</button>
        <button class="" data-action="seek-plus15">+15</button>

      </div>
    </div>

    <div>
      <h1><?= $file ?> <button role="link"><a target="_blank" href="<?= $file_web_path ?>">Download</a></button></h1>
    </div>

    <div id="comment-form">
      <textarea id="comment-textarea" placeholder="Add a marker"></textarea>
      <div class="comment-form-bottom">
        <label>Add marker at current time <input id="include-time-field" type="checkbox" name="current-time" checked /></label>
        <button data-action="add-point">Add Marker</button>
        <button class="hide" data-action="add-segment">Add a Segment at current time</button>
      </div>
    </div>

    <div class="log">
      <div id="points" class="hide">
        <h2>Markers</h2>
        <ul id="points-container">
        </ul>
      </div>
    </div>

    <div id="segments" class="hide">
      <h2>Segments</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Label</th>
            <th>Start time</th>
            <th>End time</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
    </div>

  </div>
  <script src="peaksjs/peaks.js"></script>
  <script>
    const FILE = <?= json_encode($file); ?>;
    var PEAKSJS_OPTIONS = {
      dataUri: {
        arraybuffer: <?= json_encode($wf_dat_file) ?>,
      }
    };

    var request = new XMLHttpRequest();
    var metadataUrl = 'api/read.php?file=<?= urlencode($file) ?>';
    request.open('GET', metadataUrl, false);
    request.send(null);

    if (request.status === 200) {
      console.log(request.responseText);
      var serverData = JSON.parse(request.responseText);
      Object.assign(PEAKSJS_OPTIONS, serverData);
      PEAKSJS_OPTIONS.metadataUrl = metadataUrl;
    }
  </script>
  <script src="main.js"></script>
</body>

</html>