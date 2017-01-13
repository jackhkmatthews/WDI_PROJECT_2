const google = google;

function Map(){

  // _____________________________________________
  // ...............vaiables......................
  // _____________________________________________

  this.originIndex = 0;
  this.destinationIndex = 1;
  this.direction = 'Southbound';
  this.tubeLineName = 'northern';
  this.startingLatLng = '51.61366277638, -0.27510069015';
  this.destinationCommonName = 'Morden Underground Station';
  this.mapCenter = {lat: 51.613674, lng: -0.274868};
  this.mapZoom = 14;
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
    this.journeyStationsArray = this.getJourneyStationsArray(this.startingLatLng, this.destinationCommonName);
    this.directionsService = new google.maps.DirectionsService;
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: this.mapZoom,
      center: this.mapCenter
    });
    document.getElementById('start').addEventListener('change', this.onChangeHandler.bind(this));
    document.getElementById('end').addEventListener('change', this.onChangeHandler.bind(this));
  },

  //on UI change
  // calculate and display joruney route and trigger
  //sequential setDirections and animations
  this.onChangeHandler = function onChangeHandler(){
    this.calculateAndDisplayRoute(this.directionsService, this.initNextSection);
  };

  //use google direction service to request route
  //if request is successful then get entire journey coordinates
  //and plot polyline on those coordinates
  //attach journey polyline to map
  //initialise next/first section of journey
  //which will hold animated icon
  this.calculateAndDisplayRoute = function calculateAndDisplayRoute(directionsService, callback) {
    directionsService.route({
      origin: document.getElementById('start').value,
      destination: this.destinationCommonName,
      travelMode: 'TRANSIT'
    }, function(response, status){
      if (status === 'OK') {
        tubeMap.journeyCoordinates = tubeMap.getPolylinePath(response);
        tubeMap.pathPolyLine = tubeMap.makePolyline(tubeMap.journeyCoordinates, false, '#000', 0.8, 3, null, tubeMap.map);
        tubeMap.pathPolyLine.setMap(tubeMap.map);
      }
      callback();
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
  this.initNextSection = function initNextSection(){
    console.log('inside initNextSection');
    tubeMap.directionsService = new google.maps.DirectionsService;
    tubeMap.directionsService.route({
      origin: tubeMap.stopPointsObject[tubeMap.journeyStationsArray[tubeMap.originIndex]],
      destination: tubeMap.stopPointsObject[tubeMap.journeyStationsArray[tubeMap.destinationIndex]],
      travelMode: 'TRANSIT'
    }, function(response, status){
      if (status === 'OK') {
        console.log('google response for next section', response);
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
        const duration = tubeMap.getDuration(response);
        console.log('duration from function:', duration);
        console.log('tubeMap.getStationsNextArrival');
        const stationId = tubeMap.stopPointsObject[tubeMap.journeyStationsArray[tubeMap.originIndex]].id;
        const stationCommonName = tubeMap.journeyStationsArray[tubeMap.originIndex].split(' ')[0];
        console.log('station name', stationCommonName);
        const nextStationCommonName = tubeMap.journeyStationsArray[tubeMap.originIndex + 1].split(' ')[0];
        const callback = function(nextArrival) {
          tubeMap.nextArrival = nextArrival;
          const delay = tubeMap.nextArrival.timeToStation*1000;
          console.log('delay secs', delay/1000);
          tubeMap.animateIcon(tubeMap.pathPolyLine, duration/20, delay/1000);
        };
        tubeMap.getStationsNextArrival(stationId, stationCommonName, tubeMap.direction, nextStationCommonName, callback);
        console.log('after getStationsNextArrival');
        // tubeMap.animateIcon(tubeMap.pathPolyLine, duration, delay);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  };

  // _____________________________________________
  // ............utility functions................
  // _____________________________________________

  //returns all StopPoint name and latlng
  this.getstopPointsObject = function getstopPointsObject(){
    const object = {};
    $.get(`http://localhost:3000/api/stopPoints`)
      .done(data => {
        const stations = data.stopPoints;
        $.each(stations, (index, station) => {
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
  this.getJourneyStationsArray = function getJourneyStationsArray(origin, destination){
    const array = [];
    $.get(`http://localhost:3000/tfl/Journey/JourneyResults/${origin}/to/${destination}`)
      .done(route => {
        this.tflroute = route;
        array.push(tubeMap.tflroute.journeys[0].legs[1].departurePoint.commonName);
        const stations = tubeMap.tflroute.journeys[0].legs[1].path.stopPoints;
        $.each(stations, (index, station) => {
          array.push(station.name);
        });
      });
    return array;
  };

  //receives routeResponse from google and returns
  //lat long coordinates used to polyLine path arguements
  this.getPolylinePath = function getPolylinePath(routeResponse){
    var route = routeResponse;
    for (var i = 0; i < route.routes[0].legs[0].steps.length; i++) {
      if (route.routes[0].legs[0].steps[i].travel_mode === 'TRANSIT'){
        var pathLatLngs = route.routes[0].legs[0].steps[i].lat_lngs;
      }
    }
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

  //receives path (lat lng array) and config options and returns
  //poly line attached to map
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

  //returns the train arrivng soonest to specified stopPoint
  //in specified direction
  this.getStationsNextArrival = function getStationsNextArrival(stationId, stationCommonName, direction, nextStationCommonName, callback){
    console.log('inside getStationsNextArrival');
    let nextArrival = {};
    $.get(`http://localhost:3000/tfl/StopPoint/${stationId}/Arrivals/${stationCommonName}/${direction}/${nextStationCommonName}`)
      .done(response => {
        console.log('tfl response for next arrival', response);
        if (response.message === 'end of line') {
          //send new request
          //construct next arrival equivalent
          //return next arrival equivalent
          const nextStationId = tubeMap.stopPointsObject[tubeMap.journeyStationsArray[tubeMap.originIndex + 1]].id;
          const callback = tubeMap.getEndStationsNextDepartureCallback;
          tubeMap.getEndStationsNextDeparture(stationCommonName, nextStationId, callback);
        } else {
          nextArrival = response;
          return callback(nextArrival);
        }
      });
  };

  //returns the train arrivng soonest to specified stopPoint
  //in specified direction
  this.getEndStationsNextDeparture = function getEndStationsNextDeparture(stationCommonName, nextStationId, callback){
    console.log('get end station stuff');
    let endStationsNextDeparture = {};
    $.get(`http://localhost:3000/tfl/endStopPoint/${nextStationId}/Arrivals/${stationCommonName}`)
      .done(response => {
        console.log('tfl response for end station next departure', response);
        endStationsNextDeparture = response;
        return callback(endStationsNextDeparture);
      });
  };

  this.getEndStationsNextDepartureCallback = function(endStationsNextDeparture){
    tubeMap.endStationsNextDeparture = endStationsNextDeparture;
    const duration = tubeMap.endStationsNextDeparture.timeToStation*1000;
    const delay = 1;
    tubeMap.animateIcon(tubeMap.pathPolyLine, duration/20, delay/1000);
  };

  //receives polyline and animation config options
  //sets incon in motion on line
  //when icone reaches end of line
  //removes old polyline
  //triggers google route request for next section of track
  this.animateIcon = function animateIcon(polyline, duration, delay) {
    let count = 0;
    tubeMap.originIndex += 1;
    tubeMap.destinationIndex += 1;
    const intervalId = function intervalId(){
      const countIncriment = tubeMap.getCountIncriment(duration, tubeMap.animationRefreshRate);
      const interval = setInterval(function() {
        count += countIncriment;
        if (parseFloat(polyline.icons[0].offset.split('%')[0]) > 99) {
          tubeMap.removeOldSectionInitNew(polyline, interval);
          return;
        }
        polyline.icons[0].offset = (count) + '%';
        polyline.set('icons', polyline.icons);
      }, tubeMap.animationRefreshRate);
    };
    setTimeout(intervalId, delay);
  };

  //returns countIncriment for animation pace between stations
  this.getCountIncriment = function getCountIncriment(duration, animationRefreshRate){
    const numberOfIntervals = duration / animationRefreshRate;
    const distancePercentagePerInterval = 100 / numberOfIntervals;
    return distancePercentagePerInterval;
  };

  //removes a finished section polyline and initialises the next
  this.removeOldSectionInitNew = function removeOldSectionInitNew(polyline, interval){
    polyline.setMap(null);
    polyline = null;
    clearInterval(interval);
    console.log('initNextSection()');
    tubeMap.initNextSection();
  };

  //receives google route response and give duration of transit step
  //in millisecs
  this.getDuration = function getDuration(response){
    console.log('inside getDuration');
    let durationSecs;
    for (var i = 0; i < response.routes[0].legs[0].steps.length; i++) {
      if (response.routes[0].legs[0].steps[i].travel_mode === 'TRANSIT'){
        durationSecs = response.routes[0].legs[0].steps[i].duration.value;
      }
    }
    return durationSecs * 1000;
  };
}

const tubeMap = new Map();

$(tubeMap.initMap.bind(tubeMap));
