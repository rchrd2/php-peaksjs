<?php
// php -S localhost:8000
$is_localhost = $_SERVER["REMOTE_ADDR"] == "::1";
$media_dir = $is_localhost ? "media/2021" : realpath(__DIR__."/../transit");
$file = $_GET["file"] ;
$wf_dat_file = "$file.dat";
$wf_json_file = "$file.json";

if (!isset($_GET["file"])) {

  ?>
  <h1>Index of <?=$media_dir?></h1><hr/>
  <?

  function iterateDirectory($i) {
      echo '<ul>';
      foreach ($i as $path) {
          $relative_path = str_replace("/home/rcaceres/sites/net.rchrd.dev/web", "", $path);
          if ($path->isDir()) {
              iterateDirectory($path);
          } else {
            if (file_exists("$path.dat")) {
              echo "<li><a href='?file=".urlencode($relative_path)."'>$relative_path</a></li>";
            }
          }
      }
      echo '</ul>';
  }
  $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($media_dir));
  iterateDirectory($iterator);

  exit;

} else {
  ?>
    <a href="?">
      Home
    </a>
  <?

}

?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title><?=$file?></title>
    <link rel="stylesheet" href="main.css" />
  </head>
  <body>
    <div class="container">
      <div>
        <h1><?=$file?></h1>
      </div>

      <div id="waveform-container">
        <div id="overview-container"></div>
        <div id="zoomview-container"></div>
      </div>

      <div id="demo-controls">
        <audio id="audio" controls="controls">
          <source src="<?=$file?>" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>

        <div id="controls">
          <button data-action="zoom-in">Zoom in</button>
          <button data-action="zoom-out">Zoom out</button>
          <button data-action="add-segment">Add a Segment at current time</button>
          <button data-action="add-point">Add a Point at current time</button>
          <button data-action="log-data">Log segments/points</button>
          <input class="hide" type="text" id="seek-time" value="0.0">
          <button class="hide" data-action="seek">Seek</button>
          <label class="hide" for="amplitude-scale">Amplitude scale</label>
          <input class="hide" type="range" id="amplitude-scale" min="0" max="10" step="1">
          <input class="hide" type="checkbox" id="auto-scroll" checked>
          <label class="hide" for="auto-scroll">Auto-scroll</label>
          <button class="hide" data-action="resize">Resize</button>
          <button class="hide" data-action="toggle-zoomview">Show/hide zoomable waveform</button>
          <button class="hide" data-action="toggle-overview">Show/hide overview waveform</button>
          <button class="hide" data-action="destroy">Destroy</button>
          <button class="hide2" data-action="save">Save</button>
        </div>
      </div>

      <div class="log">
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

        <div id="points" class="hide">
          <h2>Points</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Label</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
            </tbody>
          </table>
        </div>
      </div>

    </div>
    <script src="peaks.js"></script>
    <script>
      var options = {
        dataUri: {
          arraybuffer: '<?=$wf_dat_file?>',
        }
      };

      var request = new XMLHttpRequest();
      request.open('GET', 'api/read.php?file=<?=urlencode($file)?>', false);
      request.send(null);

      if (request.status === 200) {
        console.log(request.responseText);
        var serverData = JSON.parse(request.responseText);
        Object.assign(options, serverData);
      }
    </script>
    <script src="main.js"></script>
  </body>
</html>
