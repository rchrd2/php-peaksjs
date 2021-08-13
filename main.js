(function(Peaks) {
  Object.assign(options, {
    containers: {
      zoomview: document.getElementById('zoomview-container'),
      overview: document.getElementById('overview-container')
    },
    mediaElement: document.getElementById('audio'),

    keyboard: true,
    pointMarkerColor: '#006eb0',
    showPlayheadTime: true,
    zoomLevels: [ 256, 512, 1024, 2048, 4096],
  })

  var save = function(peaksInstance) {
    // console.log(points.map(p => ({startTime: p.startTime} = p))); // TODO save

    var data = {
      points: peaksInstance.points.getPoints().map(point => {
        return {
          time: point.time,
          "editable": point.editable,
          "color": point.color,
          "labelText": point.labelText
        }
      }),
      segments: peaksInstance.segments.getSegments().map(segment => {
        return {
          startTime: segment.startTime,
          endTime: segment.endTime,
          "editable": segment.editable,
          "color": segment.color,
          "labelText": segment.labelText
        }
      })
    };

    fetch('api/update.php?file=' + encodeURIComponent(FILE), {
      method: 'post',
      body: JSON.stringify(data)
    }).then(data => {
      console.log(data);
    });
  }

  var renderSegments = function(peaks) {
    var segmentsContainer = document.getElementById('segments');
    var segments = peaks.segments.getSegments();
    console.log(segments);

    var html = '';

    for (var i = 0; i < segments.length; i++) {
      var segment = segments[i];

      var row = '<tr>' +
        '<td>' + segment.id + '</td>' +
        '<td><input data-action="update-segment-label" type="text" value="' + segment.labelText + '" data-id="' + segment.id + '"/></td>' +
        '<td><input data-action="update-segment-start-time" type="number" value="' + segment.startTime + '" data-id="' + segment.id + '"/></td>' +
        '<td><input data-action="update-segment-end-time" type="number" value="' + segment.endTime + '" data-id="' + segment.id + '"/></td>' +
        '<td>' + '<a href="#' + segment.id + '" data-action="play-segment" data-id="' + segment.id + '">Play</a>' + '</td>' +
        '<td>' + '<a href="#' + segment.id + '" data-action="loop-segment" data-id="' + segment.id + '">Loop</a>' + '</td>' +
        '<td>' + '<a href="#' + segment.id + '" data-action="remove-segment" data-id="' + segment.id + '">Remove</a>' + '</td>' +
        '</tr>';

      html += row;
    }

    segmentsContainer.querySelector('tbody').innerHTML = html;

    if (html.length) {
      segmentsContainer.classList.remove('hide');
    }

    document.querySelectorAll('input[data-action="update-segment-start-time"]').forEach(function(inputElement) {
      inputElement.addEventListener('input', function(event) {
        var element = event.target;
        var id = element.getAttribute('data-id');
        var segment = peaks.segments.getSegment(id);

        if (segment) {
          var startTime = parseFloat(element.value);

          if (startTime < 0) {
            startTime = 0;
            element.value = 0;
          }

          if (startTime >= segment.endTime) {
            startTime = segment.endTime - 0.1;
            element.value = startTime;
          }

          segment.update({ startTime: startTime });
          save(peaks);
        }
      });
    });

    document.querySelectorAll('input[data-action="update-segment-end-time"]').forEach(function(inputElement) {
      inputElement.addEventListener('input', function(event) {
        var element = event.target;
        var id = element.getAttribute('data-id');
        var segment = peaks.segments.getSegment(id);

        if (segment) {
          var endTime = parseFloat(element.value);

          if (endTime < 0) {
            endTime = 0;
            element.value = 0;
          }

          if (endTime <= segment.startTime) {
            endTime = segment.startTime + 0.1;
            element.value = endTime;
          }

          segment.update({ endTime: endTime });
          save(peaks);
        }
      });
    });

    document.querySelectorAll('input[data-action="update-segment-label"]').forEach(function(inputElement) {
      inputElement.addEventListener('input', function(event) {
        var element = event.target;
        var id = element.getAttribute('data-id');
        var segment = peaks.segments.getSegment(id);
        var labelText = element.labelText;

        if (segment) {
          segment.update({ labelText: labelText });
          save(peaks);
        }
      });
    });
  };

  var renderPoints = function(peaks) {
    var pointsContainer = document.getElementById('points');
    var points = peaks.points.getPoints();
    console.log(points);
    var html = '';

    for (var i = 0; i < points.length; i++) {
      var point = points[i];

      var row = '<tr>' +
        '<td>' + point.id + '</td>' +
        '<td><input data-action="update-point-label" type="text" value="' + point.labelText + '" data-id="' + point.id + '"/></td>' +
        '<td><input data-action="update-point-time" type="number" value="' + point.time + '" data-id="' + point.id + '"/></td>' +
        '<td>' + '<a href="#' + point.id + '" data-action="remove-point" data-id="' + point.id + '">Remove</a>' + '</td>' +
        '</tr>';

      html += row;
    }

    pointsContainer.querySelector('tbody').innerHTML = html;

    if (html.length) {
      pointsContainer.classList.remove('hide');
    }

    document.querySelectorAll('input[data-action="update-point-time"]').forEach(function(inputElement) {
      inputElement.addEventListener('input', function(event) {
        var element = event.target;
        var id = element.getAttribute('data-id');
        var point = peaks.points.getPoint(id);

        if (point) {
          var time = parseFloat(element.value);

          if (time < 0) {
            time = 0;
            element.value = 0;
          }

          point.update({ time: time });
          save(peaks);
        }
      });
    });

    document.querySelectorAll('input[data-action="update-point-label"]').forEach(function(inputElement) {
      inputElement.addEventListener('input', function(event) {
        var element = event.target;
        var id = element.getAttribute('data-id');
        var point = peaks.points.getPoint(id);
        var labelText = element.value;
        if (point) {
          point.update({ labelText: labelText });
          save(peaks);
        }
      });
    });
  };

  var renderAndSave = function(peaks) {
    renderPoints(peaks);
    renderSegments(peaks);
    save(peaks);
  }

  Peaks.init(options, function(err, peaksInstance) {
    if (err) {
      console.error(err.message);
      return;
    }

    // does not seem to be supported in my version
    // var view = peaksInstance.views.getView('zoomview');
    // view.setWheelMode('scroll');

    // enable markers on overview
    const view = peaksInstance.views.getView('overview');
    view.enableMarkerEditing(true);

    peaksInstance.zoom.setZoom(4);


    console.log("Peaks instance ready");

    document.querySelector('[data-action="zoom-in"]').addEventListener('click', function() {
      peaksInstance.zoom.zoomIn();
    });

    document.querySelector('[data-action="zoom-out"]').addEventListener('click', function() {
      peaksInstance.zoom.zoomOut();
    });

    var segmentCounter = 1;

    document.querySelector('button[data-action="add-segment"]').addEventListener('click', function() {
      var labelText = prompt("Enter segment label");
      if (labelText) {
        peaksInstance.segments.add({
          startTime: peaksInstance.player.getCurrentTime(),
          endTime: peaksInstance.player.getCurrentTime() + 100,
          labelText: labelText,
          editable: true
        });
        renderAndSave(peaksInstance);
      }
    });

    document.querySelector('button[data-action="add-point"]').addEventListener('click', function() {
      var labelText = prompt("Enter point label");
      if (labelText) {
        peaksInstance.points.add({
          time: peaksInstance.player.getCurrentTime(),
          labelText: labelText,
          editable: true
        });
        renderAndSave(peaksInstance);
      }
    });

    document.querySelector('button[data-action="log-data"]').addEventListener('click', function(event) {
      renderSegments(peaksInstance);
      renderPoints(peaksInstance);
    });

    document.querySelector('button[data-action="seek"]').addEventListener('click', function(event) {
      var time = document.getElementById('seek-time').value;
      var seconds = parseFloat(time);

      if (!Number.isNaN(seconds)) {
        peaksInstance.player.seek(seconds);
      }
    });

    document.querySelector('button[data-action="destroy"]').addEventListener('click', function(event) {
      peaksInstance.destroy();
    });

    document.getElementById('auto-scroll').addEventListener('change', function(event) {
      var view = peaksInstance.views.getView('zoomview');
      view.enableAutoScroll(event.target.checked);
    });

    document.querySelector('button[data-action="save"]').addEventListener('click', function(event) {
      save(peaksInstance);
    });

    document.querySelector('body').addEventListener('click', function(event) {
      var element = event.target;
      var action  = element.getAttribute('data-action');
      var id      = element.getAttribute('data-id');

      if (action === 'play-segment') {
        var segment = peaksInstance.segments.getSegment(id);
        peaksInstance.player.playSegment(segment);
      }
      else if (action === 'loop-segment') {
        var segment = peaksInstance.segments.getSegment(id);
        peaksInstance.player.playSegment(segment, true);
      }
      else if (action === 'remove-point' && confirm("Are you sure?")) {
        peaksInstance.points.removeById(id);
        renderAndSave(peaksInstance);
      }
      else if (action === 'remove-segment' && confirm("Are you sure?")) {
        peaksInstance.segments.removeById(id);
        renderAndSave(peaksInstance);
      }
    });

    var amplitudeScales = {
      "0": 0.0,
      "1": 0.1,
      "2": 0.25,
      "3": 0.5,
      "4": 0.75,
      "5": 1.0,
      "6": 1.5,
      "7": 2.0,
      "8": 3.0,
      "9": 4.0,
      "10": 5.0
    };

    document.getElementById('amplitude-scale').addEventListener('input', function(event) {
      var scale = amplitudeScales[event.target.value];

      peaksInstance.views.getView('zoomview').setAmplitudeScale(scale);
      peaksInstance.views.getView('overview').setAmplitudeScale(scale);
    });

    document.querySelector('button[data-action="resize"]').addEventListener('click', function(event) {
      var zoomviewContainer = document.getElementById('zoomview-container');
      var overviewContainer = document.getElementById('overview-container');

      var zoomviewStyle = zoomviewContainer.offsetHeight === 200 ? 'height:300px' : 'height:200px';
      var overviewStyle = overviewContainer.offsetHeight === 85  ? 'height:200px' : 'height:85px';

      zoomviewContainer.setAttribute('style', zoomviewStyle);
      overviewContainer.setAttribute('style', overviewStyle);

      var zoomview = peaksInstance.views.getView('zoomview');
      if (zoomview) {
        zoomview.fitToContainer();
      }

      var overview = peaksInstance.views.getView('overview');
      if (overview) {
        overview.fitToContainer();
      }
    });

    document.querySelector('button[data-action="toggle-zoomview"]').addEventListener('click', function(event) {
      var container = document.getElementById('zoomview-container');
      var zoomview = peaksInstance.views.getView('zoomview');

      if (zoomview) {
        peaksInstance.views.destroyZoomview();
        container.style.display = 'none';
      }
      else {
        container.style.display = 'block';
        peaksInstance.views.createZoomview(container);
      }
    });

    document.querySelector('button[data-action="toggle-overview"]').addEventListener('click', function(event) {
      var container = document.getElementById('overview-container');
      var overview = peaksInstance.views.getView('overview');

      if (overview) {
        peaksInstance.views.destroyOverview();
        container.style.display = 'none';
      }
      else {
        container.style.display = 'block';
        peaksInstance.views.createOverview(container);
      }
    });

    renderSegments(peaksInstance);
    renderPoints(peaksInstance);

    // Points mouse events

    peaksInstance.on('points.mouseenter', function(point) {
      console.log('points.mouseenter:', point);
    });

    peaksInstance.on('points.mouseleave', function(point) {
      console.log('points.mouseleave:', point);
    });

    peaksInstance.on('points.dblclick', function(point) {
      console.log('points.dblclick:', point);
    });

    peaksInstance.on('points.dragstart', function(point) {
      console.log('points.dragstart:', point);
    });

    peaksInstance.on('points.dragmove', function(point) {
      console.log('points.dragmove:', point);
    });

    peaksInstance.on('points.dragend', function(point) {
      console.log('points.dragend:', point);
      renderAndSave(peaksInstance);
    });

    // Segments mouse events

    peaksInstance.on('segments.dragstart', function(segment, startMarker) {
      console.log('segments.dragstart:', segment, startMarker);
    });

    peaksInstance.on('segments.dragend', function(segment, startMarker) {
      console.log('segments.dragend:', segment, startMarker);
      renderAndSave(peaksInstance);
    });

    peaksInstance.on('segments.dragged', function(segment, startMarker) {
      console.log('segments.dragged:', segment, startMarker);
    });

    peaksInstance.on('segments.mouseenter', function(segment) {
      console.log('segments.mouseenter:', segment);
    });

    peaksInstance.on('segments.mouseleave', function(segment) {
      console.log('segments.mouseleave:', segment);
    });

    peaksInstance.on('segments.click', function(segment) {
      console.log('segments.click:', segment);
    });

    peaksInstance.on('zoomview.dblclick', function(time) {
      console.log('zoomview.dblclick:', time);
    });

    peaksInstance.on('overview.dblclick', function(time) {
      console.log('overview.dblclick:', time);
    });

    peaksInstance.on('player.seeked', function(time) {
      console.log('player.seeked:', time);
    });

    peaksInstance.on('player.play', function(time) {
      console.log('player.play:', time);
    });

    peaksInstance.on('player.pause', function(time) {
      console.log('player.pause:', time);
    });

    peaksInstance.on('player.ended', function() {
      console.log('player.ended');
    });
  });
})(peaks);