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

  //Initialize the file reader and its listeners
  var reader = new FileReader();

  reader.onloadstart = function (e) {
    loader.style.display = 'block';
  };

  reader.onload = function (e) {
    try {
      var parser = new window.DOMParser();
      var kml = parser.parseFromString(e.target.result, "text/xml");

      var geoJson = toGeoJSON.kml(kml);
      var heatMapData = geo.geoJsonToHeat(geoJson, 2);

      map.fitBounds(geo.getBounds(heatMapData), {padding: L.point(30, 30)});
      geo.genHeatLayer(heatMapData).addTo(map);

      //Hide overlay and expose the map
      drop.style.display = 'none';

    } catch (error) {
      loader.style.display = 'none';
      console.log('ERROR', error);
      alert('Something went wrong. The filename should be something like "history-12-31-1969.kml". Did you use the right one?');
    }
  };

  /* Set up DOM event listeners */
  //Define handler functions
  var handleDrop = function (event) {
    event.preventDefault();
    var rawFile = event.dataTransfer.files[0];
    var fileName = rawFile.name;

    if (fileName.slice(fileName.length-3, fileName.length) === "kml") {
      reader.readAsText(rawFile); 
    } else {
      loader.style.display = 'none';
      alert('You dragged the wrong file. This app only supports files that end with ".kml"');
    }
  };
  //This is necessary for our drop function to work correctly. Come on, HTML5.
  //Really?
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
  
  //Attach dropzone event handlers
  var drop = document.getElementById('container');
  drop.addEventListener('dragover', handleDragOver);
  drop.addEventListener('drop', handleDrop);

  //Set up click handler for download link
  document.getElementById('takeoutLink').onclick = function () {
    //Hide download link
    this.style.display = 'none';
    //Show drag and drop prompt
    document.getElementById('dragPrompt').style.display = 'block';
  };
}, false);
