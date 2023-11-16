// Segments mouse events

peaksInstance.on("segments.dragstart", function (segment, startMarker) {
  console.log("segments.dragstart:", segment, startMarker);
});

peaksInstance.on("segments.dragend", function (segment, startMarker) {
  console.log("segments.dragend:", segment, startMarker);
  renderAndSave(peaksInstance);
});

peaksInstance.on("segments.dragged", function (segment, startMarker) {
  console.log("segments.dragged:", segment, startMarker);
});

peaksInstance.on("segments.mouseenter", function (segment) {
  console.log("segments.mouseenter:", segment);
});

peaksInstance.on("segments.mouseleave", function (segment) {
  console.log("segments.mouseleave:", segment);
});

peaksInstance.on("segments.click", function (segment) {
  console.log("segments.click:", segment);
});

peaksInstance.on("zoomview.dblclick", function (time) {
  console.log("zoomview.dblclick:", time);
});

peaksInstance.on("overview.dblclick", function (time) {
  console.log("overview.dblclick:", time);
});

peaksInstance.on("player.seeked", function (time) {
  console.log("player.seeked:", time);
});

peaksInstance.on("player.play", function (time) {
  console.log("player.play:", time);
});

peaksInstance.on("player.pause", function (time) {
  console.log("player.pause:", time);
});

peaksInstance.on("player.ended", function () {
  console.log("player.ended");
});

peaksInstance.on("points.mouseenter", function (point) {
  console.log("points.mouseenter:", point);
});

peaksInstance.on("points.mouseleave", function (point) {
  console.log("points.mouseleave:", point);
});

peaksInstance.on("points.dblclick", function (point) {
  console.log("points.dblclick:", point);
});

peaksInstance.on("points.dragstart", function (point) {
  console.log("points.dragstart:", point);
});

peaksInstance.on("points.dragmove", function (point) {
  console.log("points.dragmove:", point);
});

document
  .querySelector('button[data-action="toggle-zoomview"]')
  .addEventListener("click", function (event) {
    var container = document.getElementById("zoomview-container");
    var zoomview = peaksInstance.views.getView("zoomview");

    if (zoomview) {
      peaksInstance.views.destroyZoomview();
      container.style.display = "none";
    } else {
      container.style.display = "block";
      peaksInstance.views.createZoomview(container);
    }
  });

document
  .querySelector('button[data-action="toggle-overview"]')
  .addEventListener("click", function (event) {
    var container = document.getElementById("overview-container");
    var overview = peaksInstance.views.getView("overview");

    if (overview) {
      peaksInstance.views.destroyOverview();
      container.style.display = "none";
    } else {
      container.style.display = "block";
      peaksInstance.views.createOverview(container);
    }
  });
