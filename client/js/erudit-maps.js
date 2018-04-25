// Create the Google Map…
var map = new google.maps.Map(d3.select("#map").node(), {
  zoom: 5,
  minZoom: 3,
  maxZoom: 6,
  center: new google.maps.LatLng(55, -72),
  mapTypeId: google.maps.MapTypeId.TERRAIN
});

var allowed_bounds = new google.maps.LatLngBounds(
  new google.maps.LatLng(1,-1),
  new google.maps.LatLng(-1, 1)
);

var last_valid_center = map.getCenter();

// google.maps.event.addListener(map, 'center_changed', function() {
//   if(allowed_bounds.contains(map.getCenter())) {
//     last_valid_center = map.getCenter();
//     return;
//   }
//   map.panTo(last_valid_center);
// });

// Limit the zoom level
// google.maps.event.addListener(map, 'zoom_changed', function() {
//   if (map.getZoom() < min_zoom) map.setZoom(min_zoom);
//   if (map.getZoom() > max_zoom) map.setZoom(max_zoom);
// });

// Load the station data. When the data comes back, create an overlay.
d3.json("stations.json", function(error, data) {
  if (error) throw error;

  var overlay = new google.maps.OverlayView();

  // Add the container when the overlay is added to the map.
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
        .attr("class", "stations");

    // Draw each marker as a separate SVG element.
    // We could use a single SVG, but what size would it have?
    overlay.draw = function() {
      var projection = this.getProjection(),
          padding = 10;

      var marker = layer.selectAll("svg")
          .data(d3.entries(data))
          .each(transform) // update existing markers
        .enter().append("svg")
          .each(transform)
          .attr("class", "marker")
          .on("mouseover", function(d) {
              d3.select(this).selectAll("circle").attr({
                fill: "orange",
                r:  9
              });
          })
          .on("mouseout", function(d) {
              d3.select(this).selectAll("circle").attr({
                fill: "brown",
                r:  4.5
              });
          })
          .on("click", function(d) {
            pushInfoWidget(d.value);
          });

      // Add a circle.
      marker.append("circle")
          .attr("r", 4.5)
          .attr("cx", padding)
          .attr("cy", padding);

      // // Add a label.
      // marker.append("text")
      //     .attr("x", padding + 7)
      //     .attr("y", padding)
      //     .attr("dy", ".31em")
      //     .text(function(d) { return d.key; });

      function transform(d) {
        d = new google.maps.LatLng(d.value["lat"], d.value["lng"]);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
      }
    };
  };

  // Bind our overlay to the map…
  overlay.setMap(map);
});

function pushInfoWidget(values) {
  var html = "<div class='tool-box-widget'>\
    <span class='widget-close' onclick='$(this).parent().remove();'>x</span>" +
    "<h2>" + values["title"] + "</h2>" +
    "<p>Journal: " + values["journal"] + "<br/>" +
    "Author: " + values["author"] + "<br/>" +
    "Year: " + values["year"] + "<br/>" +
    "Period: " + values["period"] + "</p>" +
    "</div>";

  $("#tool-box").append(html);
}


$(document).ready(function() {
  $("#tool-box").width($(window).width() * 0.2);
});
