'use strict';

var google = google;

function Map() {

  this.originIndex = 0;
  this.destinationIndex = 1;
  this.direction = 'Southbound';

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

  this.calculateAndDisplayRoute = function calculateAndDisplayRoute(directionsService) {

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
  };

  this.getPolylinePath = function getPolylinePath(routeResponse) {
    var route = routeResponse;
    for (var i = 0; i < route.routes[0].legs[0].steps.length; i++) {
      if (route.routes[0].legs[0].steps[i].travel_mode === 'TRANSIT') {
        var pathLatLngs = route.routes[0].legs[0].steps[i].lat_lngs;
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

  this.animateIcon = function animateIcon(polyline, duration, delay) {
    var count = 0;
    tubeMap.originIndex += 1;
    tubeMap.destinationIndex += 1;
    //set time out = delay
    var numberOfIntervals = duration / 20;
    var distancePercentagePerInterval = 100 / numberOfIntervals;

    var intervalId = function intervalId() {
      var interval = setInterval(function () {
        // count = (count + distancePercentagePerInterval) % 100;
        count = (count + 1) % 200;
        if (parseFloat(polyline.icons[0].offset.split('%')[0]) > 99) {
          polyline.setMap(null);
          polyline = null;
          clearInterval(interval);
          tubeMap.initNextSection();
          return;
        }
        // polyline.icons[0].offset = (count) + '%';
        polyline.icons[0].offset = count / 2 + '%';
        polyline.set('icons', polyline.icons);
      }, 20);
    };

    setTimeout(intervalId, delay);
  };

  this.initNextSection = function initNextSection() {
    this.directionsService = new google.maps.DirectionsService();
    this.directionsService.route({
      origin: this.northernLineStationsObject[this.journeyStationsArray[this.originIndex]],
      destination: this.northernLineStationsObject[this.journeyStationsArray[this.destinationIndex]],
      travelMode: 'TRANSIT'
    }, function (response, status) {
      if (status === 'OK') {
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

        tubeMap.nextArrival = tubeMap.getStationsNextArrival(tubeMap.northernLineStationsObject[tubeMap.journeyStationsArray[tubeMap.originIndex]].id, tubeMap.direction);

        // const delay = tubeMap.nextArrival.timeToStation*1000;
        console.log(tubeMap.nextArrival);

        var durationSecs = void 0;
        for (var i = 0; i < response.routes[0].legs[0].steps.length; i++) {
          if (response.routes[0].legs[0].steps[i].travel_mode === 'TRANSIT') {
            durationSecs = response.routes[0].legs[0].steps[i].duration.value;
          }
        }

        var duration = durationSecs * 1000;

        // console.log(delay/1000);

        tubeMap.animateIcon(tubeMap.pathPolyLine, duration, 1000);
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
          lng: station.lon,
          id: station.id
        };
      });
    });
    return object;
  };

  this.getStationsNextArrival = function getStationsNextArrival(stationId, destinationId) {
    var nextArrival = {};
    $.get('http://localhost:3000/api/StopPoint/' + stationId + '/Arrivals/' + destinationId).done(function (response) {
      nextArrival = response;
      console.log(nextArrival);
      return nextArrival;
    });
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