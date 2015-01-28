var map = L.map('map').setView([0,0], 2);

L.tileLayer('http://{s}.tiles.mapbox.com/v3/grantbot.kjfg3cap/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
    }).addTo(map);

var northMost;
var eastMost;
var southMost;
var westMost;

function renderGeoJson (kml) {
  var geoJson = toGeoJSON.kml(kml);
  geoHeat = geoJson2heat(geoJson, 2);

  var southWest = L.latLng(southMost, westMost);
  var northEast = L.latLng(northMost, eastMost);
  var bounds = L.latLngBounds(southWest, northEast);

  map.fitBounds(bounds,{padding: L.point(30, 30)});

  var heat = L.heatLayer(
      geoHeat, {
        minOpacity: 0.5,
        radius: 7,
        blur: 8, 
        maxZoom: 17,
        gradient: {0.2: 'lime', 0.65: 'yellow', 1: 'red'},
      }).addTo(map);
}

function geoJson2heat(geojson, intensity) {
  return geojson.features[0].geometry.coordinates.map(function(feature) {
    var lat = feature[1];
    var lng = feature[0];

    northMost = northMost || lat;
    southMost = southMost || lat;
    eastMost = eastMost || lng;
    westMost = westMost || lng;

    if (lat > northMost) { northMost = lat; }
    if (lat < southMost) { southMost = lat; }
    if (lng > westMost) { westMost = lng; }
    if (lng < eastMost) { eastMost = lng; }
    
    return [ lat, lng, intensity ];
  });
}
