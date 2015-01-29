var geo = require('./lib/geoUtils');
document.addEventListener('DOMContentLoaded', function() {
  //Check if we can drag files in
  if (typeof window.FileReader === undefined) {
    alert('Please upgrade your browser before using this app.')
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

  //Initialize the file reader and its listeners
  var reader = new FileReader();

  reader.onloadstart = function (e) {
    document.getElementById('loader').style.display = 'block';
  };

  reader.onload = function (e) {
    var parser = new window.DOMParser();
    var kml = parser.parseFromString(e.target.result, "text/xml");

    var geoJson = toGeoJSON.kml(kml);
    var heatMapData = geo.geoJsonToHeat(geoJson, 2);

    geo.fitToBounds(heatMapData, map);
    geo.renderHeatLayer(heatMapData, map);

    drop.style.display = 'none';
  };

  //Set up dropzone event listeners
  var drop = document.getElementById('container');
  drop.addEventListener('dragover', handleDragOver);
  drop.addEventListener('drop', handleDrop);
  drop.addEventListener('dragenter');

  //Set up DOM event listeners
  //Replace download link with drag prompt after user clicks it
  document.getElementById('takeoutLink').onclick = function () {
    this.style.display = 'none';
    document.getElementById('dragPrompt').style.display = 'block';
  };


  function handleDrop(event) {
    event.preventDefault();
    var rawFile = event.dataTransfer.files[0];
    var fileName = rawFile.name;

    if (fileName.slice(fileName.length-3, fileName.length) === "kml") {
      try {
        reader.readAsText(rawFile); 
      } catch (error) {
        document.getElementById('loader').style.display = 'none';
        alert('Something went wrong. The filename should be something like "history-12-31-1969.kml". Did you use the right one?');
      }
    } else {
      document.getElementById('loader').style.display = 'none';
      alert('You dragged the wrong file. This app only supports files that end with ".kml"');
    }
  }

  //This is necessary for our drop function to work correctly
  function handleDragOver(event) {
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
  }


}, false);
