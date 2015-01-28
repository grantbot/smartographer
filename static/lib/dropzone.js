  if (typeof window.FileReader === undefined) {
    alert('Your browser does not support drag and drop');
  } else {
    var drop = document.getElementById('container');

    var reader = new FileReader();
    reader.onloadstart = function ( e ) {
      console.log('LOADING');
    };
    reader.onload = function ( e ) {
      var kml = ( new window.DOMParser() ).parseFromString(e.target.result, "text/xml");
      renderGeoJson(kml);
      drop.style.display = 'none';
    };

    addEventHandler(drop, 'dragover', onDragover);
    addEventHandler(drop, 'dragenter', cancel);
    addEventHandler(drop, 'drop', function (e) {
      console.log('DROPPED');
      e.preventDefault();
      var rawFile = e.dataTransfer.files[0];
      reader.readAsText(rawFile);
    });

  }

  function addEventHandler(obj, evt, handler) {
    if(obj.addEventListener) {
      // W3C method
      obj.addEventListener(evt, handler, false);
    } else if(obj.attachEvent) {
      // IE method.
      obj.attachEvent('on'+evt, handler);
    } else {
      // Old school method.
      obj['on'+evt] = handler;
    }
  }

  function cancel(e) {
    console.log(e);
    if (e.preventDefault) { e.preventDefault(); }
    if (e.stopPropagation) { e.stopPropagation(); }
    return false;
  }
  function onDragover(e) {
    if (e.originalEvent) {
      e = e.originalEvent;
    }

    if (!e.dataTransfer) {
      return;
    }

    // Code I added begins here
    var b = e.dataTransfer.effectAllowed;

    e.dataTransfer.dropEffect = ('move' === b || 'linkMove' === b) ? 'move' : 'copy';
    // Code I added ends here


    e.stopPropagation();
    e.preventDefault();
  }
