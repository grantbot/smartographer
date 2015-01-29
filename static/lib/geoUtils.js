var fitToBounds = function (heatMapData, mapObj) {
  //Get the map bounds
  var southWestCorner = L.latLng(
      heatMapData.boundsData.southMost, 
      heatMapData.boundsData.westMost
      );
  var northEastCorner = L.latLng(
      heatMapData.boundsData.northMost, 
      heatMapData.boundsData.eastMost
      );

  var bounds = L.latLngBounds(southWestCorner, northEastCorner);

  mapObj.fitBounds(bounds, {padding: L.point(30, 30)});
};

var renderHeatLayer = function (heatMapData, mapObj) {
  //Render heat layer onto the existing map
  var heat = L.heatLayer(
        heatMapData.coordinates, 
        {
          minOpacity: 0.5,
          radius: 9,
          blur: 9, 
          maxZoom: 17,
          gradient: {0.2: 'lime', 0.7: 'yellow', 1: 'red'},
        }
      )
      .addTo(mapObj);
};

//Convert a geoJson object to heat-map friendly format, and find the map bounds
//while we're at it (so we only need one loop)
var geoJsonToHeat = function (geoJson, intensity) {
  var northMost;
  var eastMost;
  var southMost;
  var westMost;

  var coordinates = geoJson.features[0].geometry.coordinates.map(function(feature) {
    var lat = feature[1];
    var lng = feature[0];

    //Set initial values
    northMost = northMost || lat;
    southMost = southMost || lat;
    eastMost = eastMost || lng;
    westMost = westMost || lng;

    //Update them as we go
    if (lat > northMost) { northMost = lat; }
    if (lat < southMost) { southMost = lat; }
    if (lng > westMost) { westMost = lng; }
    if (lng < eastMost) { eastMost = lng; }

    return [ lat, lng, intensity ];
  });

  return {
    coordinates: coordinates,
    boundsData: {
      northMost: northMost,
      southMost: southMost,
      eastMost: eastMost,
      westMost: westMost
    }
  };
};

module.exports = {
  fitToBounds: fitToBounds,
  renderHeatLayer: renderHeatLayer,
  geoJsonToHeat: geoJsonToHeat
}
