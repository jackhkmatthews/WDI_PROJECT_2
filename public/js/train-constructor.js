'use strict';

var google = google;

function Map() {

  this.mapCenter = { lat: 51.513568, lng: -0.126688 };
  this.mapZoom = 11;

  this.init = function () {
    this.directionsService = new google.maps.DirectionsService();
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: this.mapZoom,
      center: this.mapCenter
    });
  };
}

var tubeMap = new Map();

function Train() {

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

  this.getPolylinePath = function (routeResponse) {
    for (var i = 0; i < routeResponse.routes[0].legs[0].steps.length; i++) {
      if (routeResponse.routes[0].legs[0].steps[i].travel_mode === 'TRANSIT') {
        var pathLatLngs = routeResponse.routes[0].legs[0].steps[i].lat_lngs;
      }
    }
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

  this.googleJourneyRequest = function () {
    console.log('joutney request this:', this);
    tubeMap.directionsService.route({
      origin: this.origin,
      destination: this.destination,
      travelMode: 'TRANSIT'
    }, function (response, status) {
      console.log('journey callback this:', this);
      if (status === 'OK') {
        console.log('google whole route response: ', response);
        this.journeyCoordinates = this.getPolylinePath(response);
        this.pathPolyLine = this.makePolyline(this.journeyCoordinates, false, '#000', 0.8, 3, [{
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            strokeColor: '#393'
          },
          offset: '0%'
        }], this.map);
        this.pathPolyLine.setMap(this.map);
      }
    }).call(this);
  };

  this.random = function () {
    console.log('random this', this);
  };

  this.init = function () {
    this.line = $('#line').val();
    this.origin = $('#origin').val();
    this.destination = $('#destination').val();
    tubeApp.trainCounter += 1;
    console.log('init this', this);
    this.random.call(this);
    this.googleJourneyRequest.call(this);
  }.call(this);
}

function App() {
  this.stopPointsObject;
  this.trainCounter = 0;

  this.init = function () {
    this.stopPointsObject = this.getStopPointsObject();
    tubeMap.init();
    //make ui listen
    $('.submit').on('click', this.newTrain.bind(this));
  };

  this.getStopPointsObject = function () {
    var object = {};
    $.get('http://localhost:3000/api/stopPoints').done(function (data) {
      var stations = data.stopPoints;
      $.each(stations, function (index, station) {
        object[station.commonName] = {
          lat: parseFloat(station.lat),
          lng: parseFloat(station.lng),
          id: station.id
        };
      });
    });
    return object;
  };

  this.newTrain = function () {
    this['train' + this.trainCounter] = new Train();
  };
}

var tubeApp = new App();

$(tubeApp.init.bind(tubeApp));