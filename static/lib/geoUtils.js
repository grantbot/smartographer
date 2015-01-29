//Generates a Leaflet latlngBounds object 
var getBounds = function (heatMapData) {
  var southWestCorner = L.latLng(
      heatMapData.boundsData.southMost, 
      heatMapData.boundsData.westMost
      );
  var northEastCorner = L.latLng(
      heatMapData.boundsData.northMost, 
      heatMapData.boundsData.eastMost
      );

  return L.latLngBounds(southWestCorner, northEastCorner);
};

//Generates a Leaflet heatLayer 
var genHeatLayer = function (heatMapData) {
  var heatLayer = L.heatLayer(
        heatMapData.coordinates, 
        {
          minOpacity: 0.5,
          radius: 9,
          blur: 9, 
          maxZoom: 17,
          gradient: {0.2: 'lime', 0.7: 'yellow', 1: 'red'},
        }
      );
  return heatLayer;
};

//Convert a geoJson object to heat-map friendly format, and find the map bounds
//while we're at it (so we only need to loop over it once)
var geoJsonToHeat = function (geoJson, intensity) {
  var northMost;
  var eastMost;
  var southMost;
  var westMost;

  //Loop through features and extract their coordinates into an array
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
  getBounds: getBounds,
  genHeatLayer: genHeatLayer,
  geoJsonToHeat: geoJsonToHeat
};
