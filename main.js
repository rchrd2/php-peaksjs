var amplitudeScales = {
  0: 0.0,
  1: 0.1,
  2: 0.25,
  3: 0.5,
  4: 0.75,
  5: 1.0,
  6: 1.5,
  7: 2.0,
  8: 3.0,
  9: 4.0,
  10: 5.0,
};

var zoomLevels = [
  Math.pow(2, 8),
  Math.pow(2, 9),
  Math.pow(2, 10),
  Math.pow(2, 11),
  Math.pow(2, 12),
];

function oneOf() {
  for (var i = 0; i < arguments.length; i++) {
    if (arguments[i]) return arguments[i];
  }
  return "";
}

function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}

function isElement(element) {
  return element instanceof Element || element instanceof HTMLDocument;
}

/**
 * @param {string} type
 * @param {function} handler(el)
 * @param remaining args are children
 * @returns {object} DOM element
 */
function el(typeAndClassName, handler) {
  var argOffset = 2;
  var parts = typeAndClassName.split(" ");
  var el = document.createElement(parts[0]);
  if (parts.length > 1) el.className = parts.slice(1).join(" "); // className
  if (isFunction(handler)) handler.call(el);
  else argOffset--;

  var append = function (el, v) {
    console.log(v);
    if (!isElement(v)) {
      el.appendChild(document.createTextNode(String(v)));
    } else {
      el.appendChild(v);
    }
  };

  // Append *args to created el
  for (var i = argOffset; i < arguments.length; i++) {
    if (arguments[i] instanceof Array) {
      for (var j = 0; j < arguments[i].length; j++) append(el, arguments[i][j]);
    } else {
      append(el, arguments[i]);
    }
  }
  return el;
}

function formatSecondsAsTime(secs, format) {
  var hr = Math.floor(secs / 3600);
  var min = Math.floor((secs - hr * 3600) / 60);
  var sec = Math.floor(secs - hr * 3600 - min * 60);
  if (min < 10) {
    min = "0" + min;
  }
  if (sec < 10) {
    sec = "0" + sec;
  }
  return hr + ":" + min + ":" + sec;
}

function saveToApi(peaksInstance) {
  // console.log(points.map(p => ({startTime: p.startTime} = p))); // TODO save
  var data = {
    points: peaksInstance.points.getPoints().map((point) => {
      return {
        id: point.id,
        time: point.time,
        labelText: point.labelText,
      };
    }),
    segments: peaksInstance.segments.getSegments().map((segment) => {
      return {
        id: segment.id,
        startTime: segment.startTime,
        endTime: segment.endTime,
        labelText: segment.labelText,
      };
    }),
  };

  fetch("api/update.php?file=" + encodeURIComponent(FILE), {
    method: "post",
    body: JSON.stringify(data),
  }).then((data) => {
    console.log(data);
  });
}

function sendDeleteToApi(id) {
  fetch(`api/update.php?file=${encodeURIComponent(FILE)}&delete_id=${id}`, {
    method: "post",
  }).then((data) => {
    console.log(data);
  });
}

(function (Peaks) {
  Object.assign(PEAKSJS_OPTIONS, {
    containers: {
      zoomview: document.getElementById("zoomview-container"),
      overview: document.getElementById("overview-container"),
    },
    mediaElement: document.getElementById("audio"),

    keyboard: true,
    showPlayheadTime: true,
    zoomLevels: zoomLevels,

    zoomWaveformColor: getComputedStyle(document.body).getPropertyValue(
      "--zoom-wave-form-color"
    ),
    overviewWaveformColor: getComputedStyle(document.body).getPropertyValue(
      "--overview-waveform-color"
    ),
    pointMarkerColor: getComputedStyle(document.body).getPropertyValue(
      "--point-marker-color"
    ),
    playheadColor: getComputedStyle(document.body).getPropertyValue(
      "--playhead-color"
    ),
  });

  var renderSegments = function (peaks) {
    // not supported
  };

  var renderPoints = function (peaks) {
    var pointsContainer = document.getElementById("points");
    var pointsInnerContainer = document.getElementById("points-container");
    var points = peaks.points.getPoints().sort(function (a, b) {
      return a.time > b.time;
    });
    console.log(points);

    var elements = [];

    for (var i = 0; i < points.length; i++) {
      let point = points[i];
      elements.push(
        el(
          "li comment-row hover-cursor",
          el(
            "span comment-text",
            function () {
              this.onclick = function () {
                console.log(`seeking ${point.time}`);
                if (!peaks.player.isPlaying()) {
                  peaks.player.play();
                }
                peaks.player.seek(point.time);
              };
              this.oncontextmenu = function (e) {
                e.preventDefault();
                // alert("Coming soon... editing");
                if (confirm("Would you like to delete this comment?")) {
                  renderAndDeleteById(peaks, point.id);
                }
              };
              this.setAttribute("data-id", point.id);
            },
            el("span comment-time", formatSecondsAsTime(point.time)),
            el("span", ` - ${point.labelText}`)
          )

          // el(
          //   "button comment-helper-button",
          //   function () {
          //     this.onclick = function (e) {
          //       var newValue = prompt("Edit the comment.", point.labelText);
          //       if (newValue && newValue != point.labelText) {
          //         point.update({ labelText: newValue });
          //         renderAndSave(peaks);
          //       }
          //     };
          //   },
          //   `Edit`
          // ),
          // el(
          //   "button comment-helper-button",
          //   function () {
          //     this.onclick = function (e) {
          //       if (confirm("Would you like to delete this comment?")) {
          //         peaks.points.removeById(point.id);
          //         renderAndSave(peaks);
          //       }
          //     };
          //   },
          //   `Delete`
          // )
        )
      );
    }

    pointsInnerContainer.innerHTML = "";
    elements.map((v, i) => pointsInnerContainer.appendChild(v));

    if (points.length) {
      pointsContainer.classList.remove("hide");
    }

    document
      .querySelectorAll('input[data-action="update-point-time"]')
      .forEach(function (inputElement) {
        inputElement.addEventListener("input", function (event) {
          var element = event.target;
          var id = element.getAttribute("data-id");
          var point = peaks.points.getPoint(id);

          if (point) {
            var time = parseFloat(element.value);

            if (time < 0) {
              time = 0;
              element.value = 0;
            }

            point.update({ time: time });
            saveToApi(peaks);
          }
        });
      });

    document
      .querySelectorAll('input[data-action="update-point-label"]')
      .forEach(function (inputElement) {
        inputElement.addEventListener("input", function (event) {
          var element = event.target;
          var id = element.getAttribute("data-id");
          var point = peaks.points.getPoint(id);
          var labelText = element.value;
          if (point) {
            point.update({ labelText: labelText });
            saveToApi(peaks);
          }
        });
      });
  };

  var render = function (peaksInstance) {
    renderPoints(peaksInstance);
    renderSegments(peaksInstance);
  };

  var renderAndSave = function (peaksInstance) {
    render(peaksInstance);
    saveToApi(peaksInstance);
  };

  var renderAndDeleteById = function (peaksInstance, id) {
    peaksInstance.points.removeById(id);
    render(peaksInstance);
    sendDeleteToApi(id);
  };

  var fetchNewData = function (peaksInstance) {
    var url = PEAKSJS_OPTIONS.metadataUrl;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        peaksInstance.segments.removeAll();
        peaksInstance.points.removeAll();
        data.segments?.map((segment) => {
          peaksInstance.segments.add(segment);
        });
        data.points?.map((point) => {
          peaksInstance.points.add(point);
        });
        render(peaksInstance);
      });
  };

  Peaks.init(PEAKSJS_OPTIONS, function (err, peaksInstance) {
    if (err) {
      console.error(err.message);
      return;
    }
    // enable markers on overview
    const view = peaksInstance.views.getView("overview");
    view.enableMarkerEditing(true);

    peaksInstance.zoom.setZoom(4);

    console.log("Peaks instance ready");

    document
      .querySelector('[data-action="zoom-in"]')
      .addEventListener("click", function () {
        peaksInstance.zoom.zoomIn();
      });

    document
      .querySelector('[data-action="zoom-out"]')
      .addEventListener("click", function () {
        peaksInstance.zoom.zoomOut();
      });

    document
      .querySelector('button[data-action="add-point"]')
      .addEventListener("click", function () {
        var time = peaksInstance.player.getCurrentTime();
        var commentField = document.getElementById("comment-textarea");
        var includeTimeField = document.getElementById("include-time-field");
        var labelText = commentField.value;
        if (labelText) {
          commentField.value = "";
          peaksInstance.points.add({
            id: String(+new Date()),
            time: includeTimeField.checked ? time : 0,
            labelText: labelText,
            editable: false,
          });
          renderAndSave(peaksInstance);
        }
      });

    document
      .querySelector('button[data-action="log-data"]')
      .addEventListener("click", function (event) {
        renderSegments(peaksInstance);
        renderPoints(peaksInstance);
      });

    document
      .querySelector('button[data-action="seek"]')
      .addEventListener("click", function (event) {
        var time = document.getElementById("seek-time").value;
        var seconds = parseFloat(time);

        if (!Number.isNaN(seconds)) {
          peaksInstance.player.seek(seconds);
        }
      });

    document
      .querySelector('button[data-action="destroy"]')
      .addEventListener("click", function (event) {
        peaksInstance.destroy();
      });

    document
      .getElementById("auto-scroll")
      .addEventListener("change", function (event) {
        var view = peaksInstance.views.getView("zoomview");
        view.enableAutoScroll(event.target.checked);
      });

    document
      .querySelector('button[data-action="save"]')
      .addEventListener("click", function (event) {
        saveToApi(peaksInstance);
      });

    document.querySelector("body").addEventListener("click", function (event) {
      var element = event.target;
      var action = element.getAttribute("data-action");
      var id = element.getAttribute("data-id");

      if (action === "play-segment") {
        var segment = peaksInstance.segments.getSegment(id);
        peaksInstance.player.playSegment(segment);
      } else if (action === "loop-segment") {
        var segment = peaksInstance.segments.getSegment(id);
        peaksInstance.player.playSegment(segment, true);
      } else if (action === "remove-point" && confirm("Are you sure?")) {
        peaksInstance.points.removeById(id);
        renderAndSave(peaksInstance);
      } else if (action === "remove-segment" && confirm("Are you sure?")) {
        peaksInstance.segments.removeById(id);
        renderAndSave(peaksInstance);
      } else if (action === "seek-plus15") {
        peaksInstance.player.seek(peaksInstance.player.getCurrentTime() + 15);
      } else if (action === "seek-minus15") {
        peaksInstance.player.seek(peaksInstance.player.getCurrentTime() - 15);
      }
    });

    document
      .getElementById("amplitude-scale")
      .addEventListener("input", function (event) {
        var scale = amplitudeScales[event.target.value];
        peaksInstance.views.getView("zoomview").setAmplitudeScale(scale);
        peaksInstance.views.getView("overview").setAmplitudeScale(scale);
      });

    document
      .querySelector('button[data-action="resize"]')
      .addEventListener("click", function (event) {
        var zoomviewContainer = document.getElementById("zoomview-container");
        var overviewContainer = document.getElementById("overview-container");

        var zoomviewStyle =
          zoomviewContainer.offsetHeight === 200
            ? "height:300px"
            : "height:200px";
        var overviewStyle =
          overviewContainer.offsetHeight === 85
            ? "height:200px"
            : "height:85px";

        zoomviewContainer.setAttribute("style", zoomviewStyle);
        overviewContainer.setAttribute("style", overviewStyle);

        var zoomview = peaksInstance.views.getView("zoomview");
        if (zoomview) {
          zoomview.fitToContainer();
        }

        var overview = peaksInstance.views.getView("overview");
        if (overview) {
          overview.fitToContainer();
        }
      });

    renderSegments(peaksInstance);
    renderPoints(peaksInstance);

    peaksInstance.on("points.dragend", function (point) {
      console.log("points.dragend:", point);
      renderAndSave(peaksInstance);
    });

    // Setup polling for fetching new data
    setInterval(function () {
      fetchNewData(peaksInstance);
    }, 15000);
  });
})(peaks);
