const google = google;

function Map(){

  // this.northernLineStationsArray = [];
  this.originIndex = 0;
  this.destinationIndex = 1;


  this.initMap = function initMap() {
    this.northernLineStationsArray = this.getStationsLatLngArray('northern');
    // console.log(this.northernLineStationsArray);
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 14,
      center: {lat: 51.613674, lng: -0.274868}
    });
    this.directionsDisplay.setMap(this.map);

    document.getElementById('start').addEventListener('change', this.onChangeHandler.bind(this));
    document.getElementById('end').addEventListener('change', this.onChangeHandler.bind(this));
  },

  this.onChangeHandler = function onChangeHandler(){
    this.calculateAndDisplayRoute(this.directionsService, this.directionsDisplay);
  };

  this.calculateAndDisplayRoute = function calculateAndDisplayRoute(directionsService, directionsDisplay) {

    directionsService.route({
      origin: document.getElementById('start').value,
      destination: 'Morden underground station, uk',
      travelMode: 'TRANSIT'
    }, function(response, status){
      if (status === 'OK') {
        tubeMap.pathCoordinates = tubeMap.getPolylinePath(response);

        tubeMap.pathPolyLine = tubeMap.makePolyline(tubeMap.pathCoordinates, false, '#000', 0.8, 3, null, tubeMap.map);

        tubeMap.pathPolyLine.setMap(tubeMap.map);
      }
    });

    this.initNextSection();

    // directionsService.route({
    //   origin: document.getElementById('start').value,
    //   destination: document.getElementById('end').value,
    //   travelMode: 'TRANSIT'
    // }, function(response, status){
    //   if (status === 'OK') {
    //     // directionsDisplay.setDirections(response);
    //
    //     tubeMap.pathCoordinates = tubeMap.getPolylinePath(response);
    //
    //     tubeMap.pathPolyLine = tubeMap.makePolyline(tubeMap.pathCoordinates, false, '#000', 0.8, 3, [{
    //       icon: {
    //         path: google.maps.SymbolPath.CIRCLE,
    //         scale: 8,
    //         strokeColor: '#393'
    //       },
    //       offset: '0%'
    //     }], tubeMap.map);
    //
    //     tubeMap.pathPolyLine.setMap(tubeMap.map);
    //
    //     const departureTime = response.routes[0].legs[0].departure_time.value;
    //     const arrivalTime = response.routes[0].legs[0].arrival_time.value;
    //     const durationSecs = response.routes[0].legs[0].duration.value;
    //
    //     const delay = departureTime - Date.now();
    //     const duration = durationSecs * 1000;
    //
    //     tubeMap.animateIcon(tubeMap.pathPolyLine, delay, duration);
    //
    //   } else {
    //     window.alert('Directions request failed due to ' + status);
    //   }
    // });
  };

  this.getPolylinePath = function getPolylinePath(routeResponse){
    var route = routeResponse;
    var pathLatLngs = route.routes[0].legs[0].steps[0].lat_lngs;
    var pathCoordinates = [];
    $.each(pathLatLngs, (index, element) => {
      var pathCoordinate = {
        lat: element.lat(),
        lng: element.lng()
      };
      pathCoordinates.push(pathCoordinate);
    });
    return pathCoordinates;
  };

  this.makePolyline = function makePolyline(path, geodesic, strokeColor, strokeOpacity, strokeWeight, icons, map){
    var polyline = new google.maps.Polyline({
      path,
      geodesic,
      strokeColor,
      strokeOpacity,
      strokeWeight,
      icons,
      map
    });
    return polyline;
  };

  this.animateIcon = function animateIcon(polyline, delay, duration) {
    let count = 0;
    //set time out = delay
    const numberOfIntervals = duration / 20;
    const distancePercentagePerInterval = 100 / numberOfIntervals;

    // setTimeout(intervalId, delay);

    const intervalId = window.setInterval(function animate() {
      // count = (count + distancePercentagePerInterval) % 100;
      count = (count + 1) % 200;
      if (parseFloat(polyline.icons[0].offset.split('%')[0]) > 99) {
        polyline.setMap(null);
        polyline = null;
        window.clearInterval(intervalId);
        tubeMap.initNextSection();
        return;
      }
      // polyline.icons[0].offset = (count) + '%';
      polyline.icons[0].offset = (count / 2) + '%';
      polyline.set('icons', polyline.icons);
    }, 20);
  };

  this.initNextSection = function initNextSection(){

    this.directionsService = new google.maps.DirectionsService;
    this.directionsService.route({
      origin: this.northernLineStationsArray[this.originIndex],
      destination: this.northernLineStationsArray[this.destinationIndex],
      travelMode: 'TRANSIT'
    }, function(response, status){
      if (status === 'OK') {
        // directionsDisplay.setDirections(response);

        tubeMap.pathCoordinates = tubeMap.getPolylinePath(response);

        tubeMap.pathPolyLine = tubeMap.makePolyline(tubeMap.pathCoordinates, false, '#000', 0.8, 3, [{
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            strokeColor: '#393'
          },
          offset: '0%'
        }], tubeMap.map);

        tubeMap.pathPolyLine.setMap(tubeMap.map);

        const departureTime = response.routes[0].legs[0].departure_time.value;
        const arrivalTime = response.routes[0].legs[0].arrival_time.value;
        const durationSecs = response.routes[0].legs[0].duration.value;

        const delay = departureTime - Date.now();
        const duration = durationSecs * 1000;

        tubeMap.animateIcon(tubeMap.pathPolyLine, delay, duration);

      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });

  };

  this.getStationsLatLngArray = function getStationsLatLngArray(line){
    const array = [];
    $.get(`http://localhost:3000/api/lines/${line}`)
      .done(stations => {
        $.each(stations, (index, station) => {
          array.push({
            lat: station.lat,
            lng: station.lon
          });
        });
        // tubeMap.northernLineStationsArray = array;
      });
    return array;
  };

  this.returnThis = function(hereeee){
    console.log(hereeee);
    return hereeee;
  };

}

const tubeMap = new Map();

$(tubeMap.initMap.bind(tubeMap));
