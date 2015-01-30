(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var geo = require('./lib/geoUtils');

document.addEventListener('DOMContentLoaded', function() {
  //Check if we can drag files in
  if (typeof window.FileReader === undefined) {
    alert('Please upgrade your browser before using this app.');
  }

  //Initialize the map
  var map = L.map('map').setView([0,0], 2);

  L.tileLayer(
      'http://{s}.tiles.mapbox.com/v3/grantbot.kjfg3cap/{z}/{x}/{y}.png', 
      {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18
      }
      ).addTo(map);

  //Grab the loader element so we can toggle it
  var loader = document.getElementById('loader');

  /* Initialize the file reader and its listeners */
  var reader = new FileReader();

  reader.onloadstart = function (e) {
    loader.style.display = 'block'; //Show spinner
  };

  //Do the thing
  reader.onload = function (e) {
    try {
      //Parse the user's file
      var parser = new window.DOMParser();
      var kml = parser.parseFromString(e.target.result, "text/xml");

      //Convert it to geoJSON
      var geoJson = toGeoJSON.kml(kml);
      //Convert that to a heatmap-friendly format
      var heatMapData = geo.geoJsonToHeat(geoJson, 2);

      //Change map bounds
      map.fitBounds(geo.getBounds(heatMapData), {padding: L.point(30, 30)});
      //Render the heat layer!
      geo.genHeatLayer(heatMapData).addTo(map);

      //Hide overlay and expose the map
      drop.style.display = 'none';

    } catch (error) { //KML file corrupted or wrongly formatted
      loader.style.display = 'none';
      console.log('ERROR', error);
      alert('Something went wrong. The filename should be something like "history-12-31-1969.kml". Did you use the right one?');
    }
  };

  /* Define DOM event handler functions */
  //Handle file drag-and-drop
  var handleDrop = function (event) {
    event.preventDefault();
    //Grab the file
    var rawFile = event.dataTransfer.files[0];
    var fileName = rawFile.name;

    //Make sure it's a kml
    if (fileName.slice(fileName.length-3, fileName.length) === "kml") {
      //Do the thing!
      reader.readAsText(rawFile); 
    } else {
      loader.style.display = 'none';
      alert('You dragged the wrong file. This app only supports files that end with ".kml"');
    }
  };
  //This is necessary for our drop function to work correctly. Boo, HTML5.
  var handleDragOver = function (event) {
    if (event.originalEvent) {
      event = event.originalEvent;
    }
    if (!event.dataTransfer) {
      return;
    }
    var b = event.dataTransfer.effectAllowed;

    event.dataTransfer.dropEffect = ('move' === b || 'linkMove' === b) ? 'move' : 'copy';
    event.stopPropagation();
    event.preventDefault();
  };
  
  /* Attach event handler functions */
  var drop = document.getElementById('container');
  drop.addEventListener('dragover', handleDragOver);
  drop.addEventListener('drop', handleDrop);

  //Click handler for download link
  document.getElementById('takeoutLink').onclick = function () {
    //Hide download link
    this.style.display = 'none';
    //Show drag and drop prompt
    document.getElementById('dragPrompt').style.display = 'block';
  };
}, false);

},{"./lib/geoUtils":2}],2:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInN0YXRpYy9hcHAuanMiLCJzdGF0aWMvbGliL2dlb1V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGdlbyA9IHJlcXVpcmUoJy4vbGliL2dlb1V0aWxzJyk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgLy9DaGVjayBpZiB3ZSBjYW4gZHJhZyBmaWxlcyBpblxuICBpZiAodHlwZW9mIHdpbmRvdy5GaWxlUmVhZGVyID09PSB1bmRlZmluZWQpIHtcbiAgICBhbGVydCgnUGxlYXNlIHVwZ3JhZGUgeW91ciBicm93c2VyIGJlZm9yZSB1c2luZyB0aGlzIGFwcC4nKTtcbiAgfVxuXG4gIC8vSW5pdGlhbGl6ZSB0aGUgbWFwXG4gIHZhciBtYXAgPSBMLm1hcCgnbWFwJykuc2V0VmlldyhbMCwwXSwgMik7XG5cbiAgTC50aWxlTGF5ZXIoXG4gICAgICAnaHR0cDovL3tzfS50aWxlcy5tYXBib3guY29tL3YzL2dyYW50Ym90LmtqZmczY2FwL3t6fS97eH0ve3l9LnBuZycsIFxuICAgICAge1xuICAgICAgYXR0cmlidXRpb246ICdNYXAgZGF0YSAmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vcGVuc3RyZWV0bWFwLm9yZ1wiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycywgPGEgaHJlZj1cImh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LXNhLzIuMC9cIj5DQy1CWS1TQTwvYT4sIEltYWdlcnkgwqkgPGEgaHJlZj1cImh0dHA6Ly9tYXBib3guY29tXCI+TWFwYm94PC9hPicsXG4gICAgICBtYXhab29tOiAxOFxuICAgICAgfVxuICAgICAgKS5hZGRUbyhtYXApO1xuXG4gIC8vR3JhYiB0aGUgbG9hZGVyIGVsZW1lbnQgc28gd2UgY2FuIHRvZ2dsZSBpdFxuICB2YXIgbG9hZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRlcicpO1xuXG4gIC8qIEluaXRpYWxpemUgdGhlIGZpbGUgcmVhZGVyIGFuZCBpdHMgbGlzdGVuZXJzICovXG4gIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gIHJlYWRlci5vbmxvYWRzdGFydCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgbG9hZGVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snOyAvL1Nob3cgc3Bpbm5lclxuICB9O1xuXG4gIC8vRG8gdGhlIHRoaW5nXG4gIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xuICAgIHRyeSB7XG4gICAgICAvL1BhcnNlIHRoZSB1c2VyJ3MgZmlsZVxuICAgICAgdmFyIHBhcnNlciA9IG5ldyB3aW5kb3cuRE9NUGFyc2VyKCk7XG4gICAgICB2YXIga21sID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyhlLnRhcmdldC5yZXN1bHQsIFwidGV4dC94bWxcIik7XG5cbiAgICAgIC8vQ29udmVydCBpdCB0byBnZW9KU09OXG4gICAgICB2YXIgZ2VvSnNvbiA9IHRvR2VvSlNPTi5rbWwoa21sKTtcbiAgICAgIC8vQ29udmVydCB0aGF0IHRvIGEgaGVhdG1hcC1mcmllbmRseSBmb3JtYXRcbiAgICAgIHZhciBoZWF0TWFwRGF0YSA9IGdlby5nZW9Kc29uVG9IZWF0KGdlb0pzb24sIDIpO1xuXG4gICAgICAvL0NoYW5nZSBtYXAgYm91bmRzXG4gICAgICBtYXAuZml0Qm91bmRzKGdlby5nZXRCb3VuZHMoaGVhdE1hcERhdGEpLCB7cGFkZGluZzogTC5wb2ludCgzMCwgMzApfSk7XG4gICAgICAvL1JlbmRlciB0aGUgaGVhdCBsYXllciFcbiAgICAgIGdlby5nZW5IZWF0TGF5ZXIoaGVhdE1hcERhdGEpLmFkZFRvKG1hcCk7XG5cbiAgICAgIC8vSGlkZSBvdmVybGF5IGFuZCBleHBvc2UgdGhlIG1hcFxuICAgICAgZHJvcC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gICAgfSBjYXRjaCAoZXJyb3IpIHsgLy9LTUwgZmlsZSBjb3JydXB0ZWQgb3Igd3JvbmdseSBmb3JtYXR0ZWRcbiAgICAgIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgY29uc29sZS5sb2coJ0VSUk9SJywgZXJyb3IpO1xuICAgICAgYWxlcnQoJ1NvbWV0aGluZyB3ZW50IHdyb25nLiBUaGUgZmlsZW5hbWUgc2hvdWxkIGJlIHNvbWV0aGluZyBsaWtlIFwiaGlzdG9yeS0xMi0zMS0xOTY5LmttbFwiLiBEaWQgeW91IHVzZSB0aGUgcmlnaHQgb25lPycpO1xuICAgIH1cbiAgfTtcblxuICAvKiBEZWZpbmUgRE9NIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb25zICovXG4gIC8vSGFuZGxlIGZpbGUgZHJhZy1hbmQtZHJvcFxuICB2YXIgaGFuZGxlRHJvcCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgLy9HcmFiIHRoZSBmaWxlXG4gICAgdmFyIHJhd0ZpbGUgPSBldmVudC5kYXRhVHJhbnNmZXIuZmlsZXNbMF07XG4gICAgdmFyIGZpbGVOYW1lID0gcmF3RmlsZS5uYW1lO1xuXG4gICAgLy9NYWtlIHN1cmUgaXQncyBhIGttbFxuICAgIGlmIChmaWxlTmFtZS5zbGljZShmaWxlTmFtZS5sZW5ndGgtMywgZmlsZU5hbWUubGVuZ3RoKSA9PT0gXCJrbWxcIikge1xuICAgICAgLy9EbyB0aGUgdGhpbmchXG4gICAgICByZWFkZXIucmVhZEFzVGV4dChyYXdGaWxlKTsgXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgYWxlcnQoJ1lvdSBkcmFnZ2VkIHRoZSB3cm9uZyBmaWxlLiBUaGlzIGFwcCBvbmx5IHN1cHBvcnRzIGZpbGVzIHRoYXQgZW5kIHdpdGggXCIua21sXCInKTtcbiAgICB9XG4gIH07XG4gIC8vVGhpcyBpcyBuZWNlc3NhcnkgZm9yIG91ciBkcm9wIGZ1bmN0aW9uIHRvIHdvcmsgY29ycmVjdGx5LiBCb28sIEhUTUw1LlxuICB2YXIgaGFuZGxlRHJhZ092ZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCkge1xuICAgICAgZXZlbnQgPSBldmVudC5vcmlnaW5hbEV2ZW50O1xuICAgIH1cbiAgICBpZiAoIWV2ZW50LmRhdGFUcmFuc2Zlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgYiA9IGV2ZW50LmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkO1xuXG4gICAgZXZlbnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAoJ21vdmUnID09PSBiIHx8ICdsaW5rTW92ZScgPT09IGIpID8gJ21vdmUnIDogJ2NvcHknO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH07XG4gIFxuICAvKiBBdHRhY2ggZXZlbnQgaGFuZGxlciBmdW5jdGlvbnMgKi9cbiAgdmFyIGRyb3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gIGRyb3AuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCBoYW5kbGVEcmFnT3Zlcik7XG4gIGRyb3AuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIGhhbmRsZURyb3ApO1xuXG4gIC8vQ2xpY2sgaGFuZGxlciBmb3IgZG93bmxvYWQgbGlua1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFrZW91dExpbmsnKS5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgIC8vSGlkZSBkb3dubG9hZCBsaW5rXG4gICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIC8vU2hvdyBkcmFnIGFuZCBkcm9wIHByb21wdFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkcmFnUHJvbXB0Jykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIH07XG59LCBmYWxzZSk7XG4iLCIvL0dlbmVyYXRlcyBhIExlYWZsZXQgbGF0bG5nQm91bmRzIG9iamVjdCBcbnZhciBnZXRCb3VuZHMgPSBmdW5jdGlvbiAoaGVhdE1hcERhdGEpIHtcbiAgdmFyIHNvdXRoV2VzdENvcm5lciA9IEwubGF0TG5nKFxuICAgICAgaGVhdE1hcERhdGEuYm91bmRzRGF0YS5zb3V0aE1vc3QsIFxuICAgICAgaGVhdE1hcERhdGEuYm91bmRzRGF0YS53ZXN0TW9zdFxuICAgICAgKTtcbiAgdmFyIG5vcnRoRWFzdENvcm5lciA9IEwubGF0TG5nKFxuICAgICAgaGVhdE1hcERhdGEuYm91bmRzRGF0YS5ub3J0aE1vc3QsIFxuICAgICAgaGVhdE1hcERhdGEuYm91bmRzRGF0YS5lYXN0TW9zdFxuICAgICAgKTtcblxuICByZXR1cm4gTC5sYXRMbmdCb3VuZHMoc291dGhXZXN0Q29ybmVyLCBub3J0aEVhc3RDb3JuZXIpO1xufTtcblxuLy9HZW5lcmF0ZXMgYSBMZWFmbGV0IGhlYXRMYXllciBcbnZhciBnZW5IZWF0TGF5ZXIgPSBmdW5jdGlvbiAoaGVhdE1hcERhdGEpIHtcbiAgdmFyIGhlYXRMYXllciA9IEwuaGVhdExheWVyKFxuICAgICAgICBoZWF0TWFwRGF0YS5jb29yZGluYXRlcywgXG4gICAgICAgIHtcbiAgICAgICAgICBtaW5PcGFjaXR5OiAwLjUsXG4gICAgICAgICAgcmFkaXVzOiA5LFxuICAgICAgICAgIGJsdXI6IDksIFxuICAgICAgICAgIG1heFpvb206IDE3LFxuICAgICAgICAgIGdyYWRpZW50OiB7MC4yOiAnbGltZScsIDAuNzogJ3llbGxvdycsIDE6ICdyZWQnfSxcbiAgICAgICAgfVxuICAgICAgKTtcblxuICByZXR1cm4gaGVhdExheWVyO1xufTtcblxuLy9Db252ZXJ0IGEgZ2VvSnNvbiBvYmplY3QgdG8gaGVhdC1tYXAgZnJpZW5kbHkgZm9ybWF0LCBhbmQgZmluZCB0aGUgbWFwIGJvdW5kc1xuLy93aGlsZSB3ZSdyZSBhdCBpdCAoc28gd2Ugb25seSBuZWVkIHRvIGxvb3Agb3ZlciBpdCBvbmNlKVxudmFyIGdlb0pzb25Ub0hlYXQgPSBmdW5jdGlvbiAoZ2VvSnNvbiwgaW50ZW5zaXR5KSB7XG4gIHZhciBub3J0aE1vc3Q7XG4gIHZhciBlYXN0TW9zdDtcbiAgdmFyIHNvdXRoTW9zdDtcbiAgdmFyIHdlc3RNb3N0O1xuXG4gIC8vTG9vcCB0aHJvdWdoIGZlYXR1cmVzIGFuZCBleHRyYWN0IHRoZWlyIGNvb3JkaW5hdGVzIGludG8gYW4gYXJyYXlcbiAgdmFyIGNvb3JkaW5hdGVzID0gZ2VvSnNvbi5mZWF0dXJlc1swXS5nZW9tZXRyeS5jb29yZGluYXRlcy5tYXAoZnVuY3Rpb24oZmVhdHVyZSkge1xuICAgIHZhciBsYXQgPSBmZWF0dXJlWzFdO1xuICAgIHZhciBsbmcgPSBmZWF0dXJlWzBdO1xuXG4gICAgLy9TZXQgaW5pdGlhbCB2YWx1ZXNcbiAgICBub3J0aE1vc3QgPSBub3J0aE1vc3QgfHwgbGF0O1xuICAgIHNvdXRoTW9zdCA9IHNvdXRoTW9zdCB8fCBsYXQ7XG4gICAgZWFzdE1vc3QgPSBlYXN0TW9zdCB8fCBsbmc7XG4gICAgd2VzdE1vc3QgPSB3ZXN0TW9zdCB8fCBsbmc7XG5cbiAgICAvL1VwZGF0ZSB0aGVtIGFzIHdlIGdvXG4gICAgaWYgKGxhdCA+IG5vcnRoTW9zdCkgeyBub3J0aE1vc3QgPSBsYXQ7IH1cbiAgICBpZiAobGF0IDwgc291dGhNb3N0KSB7IHNvdXRoTW9zdCA9IGxhdDsgfVxuICAgIGlmIChsbmcgPiB3ZXN0TW9zdCkgeyB3ZXN0TW9zdCA9IGxuZzsgfVxuICAgIGlmIChsbmcgPCBlYXN0TW9zdCkgeyBlYXN0TW9zdCA9IGxuZzsgfVxuXG4gICAgcmV0dXJuIFsgbGF0LCBsbmcsIGludGVuc2l0eSBdO1xuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlcyxcbiAgICBib3VuZHNEYXRhOiB7XG4gICAgICBub3J0aE1vc3Q6IG5vcnRoTW9zdCxcbiAgICAgIHNvdXRoTW9zdDogc291dGhNb3N0LFxuICAgICAgZWFzdE1vc3Q6IGVhc3RNb3N0LFxuICAgICAgd2VzdE1vc3Q6IHdlc3RNb3N0XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldEJvdW5kczogZ2V0Qm91bmRzLFxuICBnZW5IZWF0TGF5ZXI6IGdlbkhlYXRMYXllcixcbiAgZ2VvSnNvblRvSGVhdDogZ2VvSnNvblRvSGVhdFxufTtcbiJdfQ==
