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

  this.line;
  this.lineColor;
  this.iconColor;
  this.origin;
  this.destination;
  this.originIndex = 0;
  this.destinationIndex = 0;
  this.animationRefreshRate = 20;

  this.removeOldSection = function (polyline, interval) {
    polyline.setMap(null);
    polyline = null;
    if (interval) clearInterval(interval);
  };

  this.getCountIncriment = function getCountIncriment(duration, animationRefreshRate) {
    var numberOfIntervals = duration / animationRefreshRate;
    var distancePercentagePerInterval = 100 / numberOfIntervals;
    return distancePercentagePerInterval;
  };

  this.animateIcon = function (polyline, duration, delay) {
    var self = this;
    console.log('animateIcon this', this);
    var count = 0;
    this.originIndex += 1;
    this.destinationIndex += 1;
    var intervalId = function intervalId() {
      console.log('intervalId this', self);
      var countIncriment = self.getCountIncriment(duration, self.animationRefreshRate);
      var interval = setInterval(function () {
        count += countIncriment;
        if (parseFloat(polyline.icons[0].offset.split('%')[0]) > 99) {
          self.removeOldSection(self.pathPolyLine, interval);
          return console.log('finished journey');
        }
        polyline.icons[0].offset = count + '%';
        polyline.set('icons', polyline.icons);
      }, this.animationRefreshRate);
    };
    setTimeout(intervalId, delay);
  };

  this.getDuration = function (response) {
    console.log('getDuration this', this);
    var durationSecs = void 0;
    for (var i = 0; i < response.routes[0].legs[0].steps.length; i++) {
      if (response.routes[0].legs[0].steps[i].travel_mode === 'TRANSIT') {
        durationSecs = response.routes[0].legs[0].steps[i].duration.value;
      }
    }
    return durationSecs * 1000;
  };

  this.makePolyline = function makePolyline(path, geodesic, strokeColor, strokeOpacity, strokeWeight, icons, map) {
    console.log('makePolyline this', this);
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
    console.log('getPolylinePath this', this);
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

  this.departTrain = function (response) {
    console.log('setpolyline this', this);
    this.journeyCoordinates = this.getPolylinePath(response);
    this.pathPolyLine = this.makePolyline(this.journeyCoordinates, false, this.lineColor, 1, 4, [{
      icon: {
        path: 0,
        scale: 8,
        strokeColor: this.lineColor
      },
      offset: '0%'
    }], this.map);
    this.pathPolyLine.setMap(tubeMap.map);
    this.duration = this.getDuration(response);
    this.delay = 0;
    this.animateIcon.call(this, this.pathPolyLine, this.duration, this.delay);
  };

  this.googleJourneyRequest = function (callback) {
    console.log('journey request this:', this);
    var self = this;
    self.directionsService.route({
      origin: this.origin,
      destination: this.destination,
      travelMode: 'TRANSIT'
    }, function (response, status) {
      console.log('journey callback this:', self);
      if (status === 'OK') {
        console.log('google whole route response: ', response);
        callback.call(self, response);
      }
    });
  };

  this.random = function () {
    console.log('random this', this);
  };

  this.addTrainTag = function () {
    //$("<div>").html("New Data").insertAfter("#topofpage").hide().slideDown("slow");
    $('\n      <li class="c-menu__item train" style="background-color: ' + this.lineColor + '">\n        <ul>\n          <li class="from">From</li>\n          <li class="originName">' + this.originName + '</li>\n          <li class="to">To</li>\n          <li class="destinationName">' + this.destinationName + '</li>\n        </ul>\n      </li>\n    ').insertAfter('.c-menu__item:first').hide().slideDown('fast');
  };

  this.init = function () {
    this.line = $('#line').val();
    this.lineColor = $('option[value=' + this.line + ']').attr('data-color');
    this.origin = $('#origin').val();
    this.originName = $('option[value="' + this.origin + '"]:first').text();
    this.destination = $('#destination').val();
    this.destinationName = $('option[value="' + this.destination + '"]:first').text();
    this.addTrainTag.call(this);
    console.log('init this', this);
    this.random.call(this);
    this.directionsService = new google.maps.DirectionsService();
    this.googleJourneyRequest.call(this, this.departTrain);
    tubeApp.trainCounter += 1;
  }.call(this);
}

function App() {
  this.stopPointsObject;
  this.trainCounter = 0;
  this.serverUrl = 'http://localhost:3000';

  this.ajaxRequest = function (url, method, data, callback) {
    $.ajax(url, {
      method: method,
      data: data
    }).done(function (data) {
      callback(data);
    });
  };

  this.handelForm = function (form) {
    var method = $(form).attr('method');
    var data = $(form).serialize();
    var url = '' + this.serverUrl + $(form).attr('action');
    var ajaxOptionsArray = [method, data, url];
    return ajaxOptionsArray;
  };

  this.loginForm = function (e) {
    var self = this;
    e.preventDefault();
    var method = $(e.target).attr('method');
    var data = $(e.target).serialize();
    var url = '' + this.serverUrl + $(e.target).attr('action');
    console.log(data);
    this.ajaxRequest(url, method, data, function (data) {
      if (data.user.firstName) {
        $('#c-menu--slide-left-login .c-menu__items').html('\n          Welcome back ' + data.user.firstName + '!<br>\n          Try not to break it this time!\n          ');
        self.loggedInState();
      } else {
        console.log('something went wrong when logining in user. data returned: ', data);
      }
    });
  };

  this.registerForm = function (e) {
    e.preventDefault();
    var method = $(e.target).attr('method');
    var data = $(e.target).serialize();
    var url = '' + this.serverUrl + $(e.target).attr('action');

    this.ajaxRequest(url, method, data, function (data) {
      if (data.user.firstName) {
        $('#c-menu--slide-left-register .c-menu__items').html('\n          Welcome ' + data.user.firstName + '!<br>\n          OMFG, ' + data.user.favouriteLine + ' is my favourite line to!\n          ');
      } else {
        console.log('something went wrong when registering user. data returned: ', data);
      }
    });
  };

  this.newTrain = function () {
    this['train' + this.trainCounter] = new Train();
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

  this.loggedOutState = function () {
    $('.loggedOut').show();
    $('.loggedIn').hide();
  };

  this.loggedInState = function () {
    $('.loggedOut').hide();
    $('.loggedIn').show();
  };

  this.init = function () {
    this.loggedOutState();
    this.stopPointsObject = this.getStopPointsObject();
    tubeMap.init();
    //make ui listen
    $('.submit.train').on('click', this.newTrain.bind(this));
    $('form.register').on('submit', this.registerForm.bind(this));
    $('form.login').on('submit', this.loginForm.bind(this));
  };
}

var tubeApp = new App();

$(tubeApp.init.bind(tubeApp));