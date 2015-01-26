var latlng = L.latLng(37.7833, -122.4167);
var map = L.map('map').setView(latlng, 13);

L.tileLayer('http://{s}.tiles.mapbox.com/v3/grantbot.kjfg3cap/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
    }).addTo(map);

omnivore.kml('static/history-12-31-1969.kml').addTo(map);
