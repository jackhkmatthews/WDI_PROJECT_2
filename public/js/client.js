'use strict';

var google = google;

function Map() {

  // _____________________________________________
  // ...............vaiables......................
  // _____________________________________________

  this.originIndex = 0;
  this.destinationIndex = 1;
  this.direction = 'Southbound';
  this.mapCenter = { lat: 51.513568, lng: -0.126688 };
  this.mapZoom = 11;
  this.animationRefreshRate = 20;

  // _____________________________________________
  // ..........control flow functions.............
  // _____________________________________________

  //sending requests to tfl api
  //and saving data
  //creating google directions object for route requests
  //creating google map object
  //making UI listen
  this.initMap = function initMap() {
    this.stopPointsObject = this.getstopPointsObject();
    this.directionsService = new google.maps.DirectionsService();
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: this.mapZoom,
      center: this.mapCenter
    });
    $('.submit').on('click', this.calculateAndDisplayRoute.bind(this));
  },

  //use google direction service to request route
  //if request is successful then get entire journey coordinates
  //and plot polyline on those coordinates
  //attach journey polyline to map
  //initialise next/first section of journey
  //which will hold animated icon
  this.calculateAndDisplayRoute = function calculateAndDisplayRoute() {

    var originLatLng = $('#origin').val();
    tubeMap.journeyOrigin = $('option[value="' + originLatLng + '"]:first').text();
    var destinationLatLng = $('#destination').val();

    this.getJourneyStationsArray(originLatLng, destinationLatLng, this.googleJourneyRequest);
  };

  //make a request to google for the whole journey
  this.googleJourneyRequest = function () {
    tubeMap.directionsService.route({
      origin: document.getElementById('origin').value,
      destination: document.getElementById('destination').value,
      travelMode: 'TRANSIT'
    }, function (response, status) {
      if (status === 'OK') {
        console.log('google whole route response: ', response);
        tubeMap.journeyCoordinates = tubeMap.getPolylinePath(response);
        tubeMap.pathPolyLine = tubeMap.makePolyline(tubeMap.journeyCoordinates, false, '#000', 0.8, 3, [{
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            strokeColor: '#393'
          },
          offset: '0%'
        }], tubeMap.map);
        tubeMap.pathPolyLine.setMap(tubeMap.map);
      }
      // tubeMap.initNextSection();
      //..................the below to be commented out once tfl back..............//
      var duration = tubeMap.getDuration(response);
      var delay = 0;
      tubeMap.animateIcon(tubeMap.pathPolyLine, duration, delay);
    });
  };

  //makes new google route request based on journey stations array
  //from ftl api journey planner request
  //and origin and destination index
  //on succeful route response from google
  //get polyline coordinates / path / lat longs
  //create polyline from those coordinates
  //bind to map
  //use google response to find out duration in setDirections
  //make request to tfl to find out when next tube is
  //arriving to the start of the polyline
  //i.e the current origin index on the journeyStationsArray
  //animate icon on current section polyline with correct
  //duration and delay from requests to google and tfl
  this.initNextSection = function initNextSection() {
    console.log('inside initNextSection');
    tubeMap.directionsService = new google.maps.DirectionsService();
    tubeMap.directionsService.route({
      origin: tubeMap.stopPointsObject[tubeMap.journeyStationsArray[tubeMap.originIndex]],
      destination: tubeMap.stopPointsObject[tubeMap.journeyStationsArray[tubeMap.destinationIndex]],
      travelMode: 'TRANSIT'
    }, function (response, status) {
      if (status === 'OK') {
        (function () {
          console.log('google next section response: ', response);
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
          var duration = tubeMap.getDuration(response);
          var stationId = tubeMap.stopPointsObject[tubeMap.journeyStationsArray[tubeMap.originIndex]].id;
          var stationCommonName = tubeMap.journeyStationsArray[tubeMap.originIndex].split(' ')[0];
          var nextStationCommonName = tubeMap.journeyStationsArray[tubeMap.originIndex + 1].split(' ')[0];
          var callback = function callback(nextArrival) {
            tubeMap.nextArrival = nextArrival;
            var delay = tubeMap.nextArrival.timeToStation * 1000;
            tubeMap.animateIcon(tubeMap.pathPolyLine, duration / 200, delay / 200);
          };
          tubeMap.getStationsNextArrival(stationId, stationCommonName, tubeMap.direction, nextStationCommonName, callback);
          // tubeMap.animateIcon(tubeMap.pathPolyLine, duration, delay);
        })();
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  };

  // _____________________________________________
  // ............utility functions................
  // _____________________________________________

  //returns all StopPoint name and latlng
  this.getstopPointsObject = function getstopPointsObject() {
    var object = {};
    $.get('https://tube-map.herokuapp.com/api/stopPoints').done(function (data) {
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

  //returns all names of stations between specified stopPoints
  this.getJourneyStationsArray = function getJourneyStationsArray(origin, destination, callback) {
    var array = [];
    $.get('http://localhost:3000/tfl/Journey/JourneyResults/' + origin + '/to/' + destination).done(function (route) {
      var legs = route.journeys[0].legs;
      var stopPoints = legs[0].path.stopPoints;
      // let departurePoint = legs[0].departurePoint.commonName;
      $.each(legs, function (index, leg) {
        if (leg.path.stopPoints.length > stopPoints.length) {
          stopPoints = leg.path.stopPoints;
          // departurePoint = leg.departurePoint.commonName;
        }
      });
      $.each(stopPoints, function (index, stopPoint) {
        array.push(stopPoint.name);
      });
      if (array[0] !== tubeMap.journeyOrigin) {
        array.unshift(tubeMap.journeyOrigin);
      }
      tubeMap.journeyStationsArray = array;
      return callback();
    });
  };

  //receives routeResponse from google and returns
  //lat long coordinates used to polyLine path arguements
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

  //receives path (lat lng array) and config options and returns
  //poly line attached to map
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

  //returns the train arrivng soonest to specified stopPoint
  //in specified direction
  // if end of line send new request
  //construct next arrival equivalent
  //return next arrival equivalent
  this.getStationsNextArrival = function getStationsNextArrival(stationId, stationCommonName, direction, nextStationCommonName, callback) {
    var _this = this;

    console.log('inside getStationsNextArrival function', stationId);
    var nextArrival = {};
    $.get('http://localhost:3000/tfl/StopPoint/' + stationId + '/Arrivals/' + stationCommonName + '/' + direction + '/' + nextStationCommonName).done(function (response) {
      console.log('tfl next arrival response:', response);
      if (response.message === 'end of line') {
        var nextStationId = tubeMap.stopPointsObject[tubeMap.journeyStationsArray[tubeMap.originIndex + 1]].id;
        var _callback = tubeMap.getEndStationsNextDepartureCallback;
        tubeMap.getEndStationsNextDeparture(stationCommonName, nextStationId, _callback);
      } else if (response.message === 'no trains in right direction') {
        setTimeout(function () {
          return _this.getStationsNextArrival(stationId, stationCommonName, direction, nextStationCommonName, callback);
        }, 5000);
      } else {
        nextArrival = response;
        return callback(nextArrival);
      }
    });
  };

  //returns the train arrivng soonest to specified stopPoint
  //in specified direction
  this.getEndStationsNextDeparture = function getEndStationsNextDeparture(stationCommonName, nextStationId, callback) {
    var _this2 = this;

    var endStationsNextDeparture = {};
    $.get('http://localhost:3000/tfl/endStopPoint/' + nextStationId + '/Arrivals/' + stationCommonName).done(function (response) {
      if (!response.timeToStation) {
        console.log('response is an empty object: ' + response);
        setTimeout(function () {
          return _this2.getEndStationsNextDeparture(stationCommonName, nextStationId, callback);
        }, 5000);
      } else {
        endStationsNextDeparture = response;
        return callback(endStationsNextDeparture);
      }
    });
  };

  //to be exicuted on return of departure info
  //triggers animation
  this.getEndStationsNextDepartureCallback = function (endStationsNextDeparture) {
    tubeMap.endStationsNextDeparture = endStationsNextDeparture;
    var duration = tubeMap.endStationsNextDeparture.timeToStation * 1000;
    var delay = 1;
    tubeMap.animateIcon(tubeMap.pathPolyLine, duration / 200, delay / 200);
  };

  //receives polyline and animation config options
  //sets incon in motion on line
  //when icone reaches end of line
  //removes old polyline
  //triggers google route request for next section of track
  this.animateIcon = function animateIcon(polyline, duration, delay) {
    var count = 0;
    tubeMap.originIndex += 1;
    tubeMap.destinationIndex += 1;
    var intervalId = function intervalId() {
      var countIncriment = tubeMap.getCountIncriment(duration, tubeMap.animationRefreshRate);
      var interval = setInterval(function () {
        count += countIncriment;
        if (parseFloat(polyline.icons[0].offset.split('%')[0]) > 99) {
          tubeMap.removeOldSection(polyline, interval);
          tubeMap.removeOldSection(tubeMap.pathPolyLine);
          if (tubeMap.journeyStationsArray.length === tubeMap.destinationIndex) {
            return console.log('finished journey');
          }
          tubeMap.initNextSection();
          return;
        }
        polyline.icons[0].offset = count + '%';
        polyline.set('icons', polyline.icons);
      }, tubeMap.animationRefreshRate);
    };
    setTimeout(intervalId, delay);
  };

  //returns countIncriment for animation pace between stations
  this.getCountIncriment = function getCountIncriment(duration, animationRefreshRate) {
    var numberOfIntervals = duration / animationRefreshRate;
    var distancePercentagePerInterval = 100 / numberOfIntervals;
    return distancePercentagePerInterval;
  };

  //removes a finished section polyline and initialises the next
  this.removeOldSection = function removeOldSection(polyline, interval) {
    polyline.setMap(null);
    polyline = null;
    if (interval) clearInterval(interval);
  };

  //receives google route response and give duration of transit step
  //in millisecs
  this.getDuration = function getDuration(response) {
    console.log('insed getDuration function');
    var durationSecs = void 0;
    for (var i = 0; i < response.routes[0].legs[0].steps.length; i++) {
      if (response.routes[0].legs[0].steps[i].travel_mode === 'TRANSIT') {
        durationSecs = response.routes[0].legs[0].steps[i].duration.value;
      }
    }
    return durationSecs * 1000;
  };
}

var tubeMap = new Map();

$(tubeMap.initMap.bind(tubeMap));