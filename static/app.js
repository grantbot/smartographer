var latlng = L.latLng(37.7833, -122.4167);
var map = L.map('map').setView(latlng, 13);

L.tileLayer('http://{s}.tiles.mapbox.com/v3/grantbot.kjfg3cap/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
    }).addTo(map);

var geoJson;
$.ajax('static/history-12-31-1969.kml').done(function(kml) {
  geoJson = toGeoJSON.kml(kml);
  console.log(geoJson.features[0]);
  geoHeat = geoJson2heat(geoJson, 2);

  var heat = L.heatLayer(
      geoHeat, {
        radius: 10,
        blur: 1, 
        maxZoom: 17,
  }).addTo(map);
});

function geoJson2heat(geojson, intensity) {
  return geojson.features[0].geometry.coordinates.map(function(feature) {
    return [
      feature[1],
      feature[0],
      intensity
    ];
  });
}
