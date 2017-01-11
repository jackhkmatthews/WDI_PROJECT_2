'use strict';

var google = google;

function Map() {

  this.originIndex = 0;
  this.destinationIndex = 1;

  this.initMap = function initMap() {
    this.northernLineStationsObject = this.getStationsLatLngObject('northern');
    this.journeyStationsArray = this.getJourneyStationsArray('51.61366277638,-0.27510069015', 'Morden Underground Station');
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 14,
      center: { lat: 51.613674, lng: -0.274868 }
    });
    this.directionsDisplay.setMap(this.map);

    document.getElementById('start').addEventListener('change', this.onChangeHandler.bind(this));
    document.getElementById('end').addEventListener('change', this.onChangeHandler.bind(this));
  }, this.onChangeHandler = function onChangeHandler() {
    this.calculateAndDisplayRoute(this.directionsService, this.directionsDisplay);
  };

  this.calculateAndDisplayRoute = function calculateAndDisplayRoute(directionsService, directionsDisplay) {

    directionsService.route({
      origin: document.getElementById('start').value,
      destination: 'Morden underground station, uk',
      travelMode: 'TRANSIT'
    }, function (response, status) {
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

  this.getPolylinePath = function getPolylinePath(routeResponse) {
    var route = routeResponse;
    var pathLatLngs = route.routes[0].legs[0].steps[0].lat_lngs;
    var pathCoordinates = [];
    $.each(pathLatLngs, function (index, element) {
      var pathCoordinate = {
        lat: element.lat(),
        lng: element.lng()
      };
      pathCoordinates.push(pathCoordinate);
    });
    return pathCoordinates;
  };

  this.makePolyline = function makePolyline(path, geodesic, strokeColor, strokeOpacity, strokeWeight, icons, map) {
    var polyline = new google.maps.Polyline({
      path: path,
      geodesic: geodesic,
      strokeColor: strokeColor,
      strokeOpacity: strokeOpacity,
      strokeWeight: strokeWeight,
      icons: icons,
      map: map
    });
    return polyline;
  };

  this.animateIcon = function animateIcon(polyline, delay, duration) {
    var count = 0;
    tubeMap.originIndex += 1;
    tubeMap.destinationIndex += 1;
    //set time out = delay
    var numberOfIntervals = duration / 20;
    var distancePercentagePerInterval = 100 / numberOfIntervals;

    // setTimeout(intervalId, delay);

    var intervalId = window.setInterval(function animate() {
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
      polyline.icons[0].offset = count / 2 + '%';
      polyline.set('icons', polyline.icons);
    }, 20);
  };

  this.initNextSection = function initNextSection() {

    this.directionsService = new google.maps.DirectionsService();
    this.directionsService.route({
      origin: this.northernLineStationsObject[this.journeyStationsArray[this.originIndex]],
      destination: this.northernLineStationsObject[this.journeyStationsArray[this.destinationIndex]],
      travelMode: 'TRANSIT'
    }, function (response, status) {
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

        var departureTime = response.routes[0].legs[0].departure_time.value;
        var arrivalTime = response.routes[0].legs[0].arrival_time.value;
        var durationSecs = response.routes[0].legs[0].duration.value;

        var delay = departureTime - Date.now();
        var duration = durationSecs * 1000;

        tubeMap.animateIcon(tubeMap.pathPolyLine, delay, duration);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  };

  this.getStationsLatLngObject = function getStationsLatLngObject(line) {
    var object = {};
    $.get('http://localhost:3000/api/lines/' + line).done(function (stations) {
      $.each(stations, function (index, station) {
        object[station.commonName] = {
          lat: station.lat,
          lng: station.lon
        };
      });
    });
    return object;
  };

  this.getJourneyStationsArray = function getJourneyStationsArray(from, to) {
    var _this = this;

    var array = [];
    $.get('http://localhost:3000/api/lines/' + from + '/' + to).done(function (route) {
      _this.tflroute = route;
      array.push(tubeMap.tflroute.journeys[0].legs[1].departurePoint.commonName);
      var stations = tubeMap.tflroute.journeys[0].legs[1].path.stopPoints;
      $.each(stations, function (index, station) {
        array.push(station.name);
      });
    });
    return array;
  };
}

var tubeMap = new Map();

$(tubeMap.initMap.bind(tubeMap));