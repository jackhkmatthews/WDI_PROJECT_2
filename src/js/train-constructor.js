const google = google;

function Map() {

  this.mapCenter = {lat: 51.513568, lng: -0.126688};
  this.mapZoom = 11;

  this.init = function() {
    this.directionsService = new google.maps.DirectionsService;
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: this.mapZoom,
      center: this.mapCenter
    });
  };
}

const tubeMap = new Map();

function Train() {

  this.line;
  this.lineColor;
  this.iconColor;
  this.origin;
  this.destination;
  this.originIndex = 0;
  this.destinationIndex = 0;
  this.animationRefreshRate = 20;

  this.removeOldSection = function(polyline, interval){
    polyline.setMap(null);
    polyline = null;
    if(interval) clearInterval(interval);
  };

  this.getCountIncriment = function getCountIncriment(duration, animationRefreshRate){
    const numberOfIntervals = duration / animationRefreshRate;
    const distancePercentagePerInterval = 100 / numberOfIntervals;
    return distancePercentagePerInterval;
  };

  this.animateIcon = function(polyline, duration, delay) {
    const self = this;
    console.log('animateIcon this', this);
    let count = 0;
    this.originIndex += 1;
    this.destinationIndex += 1;
    const intervalId = function intervalId(){
      console.log('intervalId this', self);
      const countIncriment = self.getCountIncriment(duration, self.animationRefreshRate);
      const interval = setInterval(function() {
        count += countIncriment;
        if (parseFloat(polyline.icons[0].offset.split('%')[0]) > 99) {
          self.removeOldSection(self.pathPolyLine, interval);
          return console.log('finished journey');
        }
        polyline.icons[0].offset = (count) + '%';
        polyline.set('icons', polyline.icons);
      }, this.animationRefreshRate);
    };
    setTimeout(intervalId, delay);
  };

  this.getDuration = function(response) {
    console.log('getDuration this', this);
    let durationSecs;
    for (var i = 0; i < response.routes[0].legs[0].steps.length; i++) {
      if (response.routes[0].legs[0].steps[i].travel_mode === 'TRANSIT'){
        durationSecs = response.routes[0].legs[0].steps[i].duration.value;
      }
    }
    return durationSecs * 1000;
  };

  this.makePolyline = function makePolyline(path, geodesic, strokeColor, strokeOpacity, strokeWeight, icons, map){
    console.log('makePolyline this', this);
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

  this.getPolylinePath = function(routeResponse){
    console.log('getPolylinePath this', this);
    for (var i = 0; i < routeResponse.routes[0].legs[0].steps.length; i++) {
      if (routeResponse.routes[0].legs[0].steps[i].travel_mode === 'TRANSIT'){
        var pathLatLngs = routeResponse.routes[0].legs[0].steps[i].lat_lngs;
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

  this.departTrain = function(response){
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

  this.googleJourneyRequest = function(callback){
    console.log('journey request this:', this);
    const self = this;
    self.directionsService.route({
      origin: this.origin,
      destination: this.destination,
      travelMode: 'TRANSIT'
    }, function(response, status){
      console.log('journey callback this:', self);
      if (status === 'OK') {
        console.log('google whole route response: ', response);
        callback.call(self, response);
      }
    });
  };

  this.random = function(){
    console.log('random this', this);
  };

  this.addTrainTag = function() {
    //$("<div>").html("New Data").insertAfter("#topofpage").hide().slideDown("slow");
    $(`
      <li class="c-menu__item train" style="background-color: ${this.lineColor}">
        <ul>
          <li class="from">From</li>
          <li class="originName">${this.originName}</li>
          <li class="to">To</li>
          <li class="destinationName">${this.destinationName}</li>
        </ul>
      </li>
    `).insertAfter('.c-menu__item:first').hide().slideDown('fast');
  };

  this.init = function(){
    this.line = $('#line').val();
    this.lineColor = $(`option[value=${this.line}]`).attr('data-color');
    this.origin = $('#origin').val();
    this.originName = $(`option[value="${this.origin}"]:first`).text();
    this.destination = $('#destination').val();
    this.destinationName = $(`option[value="${this.destination}"]:first`).text();
    this.addTrainTag.call(this);
    console.log('init this', this);
    this.random.call(this);
    this.directionsService = new google.maps.DirectionsService;
    this.googleJourneyRequest.call(this, this.departTrain);
    tubeApp.trainCounter += 1;
  }.call(this);
}

function App(){
  this.stopPointsObject;
  this.trainCounter = 0;
  this.serverUrl = 'http://localhost:3000';

  this.removeToken = function(){
    window.localStorage.clear();
  };

  this.getToken = function(){
    return window.localStorage.getItem('token');
  };

  this.setToken = function(token){
    window.localStorage.setItem('token', token);
  };

  this.logout = function(){
    this.loggedOutState();
    this.removeToken();
  };

  this.ajaxRequest = function(url, method, data, callback){
    $.ajax(url, {
      method,
      data
    }).done(data => {
      callback(data);
    });
  };

  this.handelForm = function(form){
    const method = $(form).attr('method');
    const data = $(form).serialize();
    const url = `${this.serverUrl}${$(form).attr('action')}`;
    const ajaxOptionsArray = [method, data, url];
    return ajaxOptionsArray;
  };

  this.loginForm = function(e){
    const self = this;
    e.preventDefault();
    const method = $(e.target).attr('method');
    const data = $(e.target).serialize();
    const url = `${this.serverUrl}${$(e.target).attr('action')}`;
    console.log(data);
    this.ajaxRequest(url, method, data, data => {
      if(data.user.firstName) {
        $('#c-menu--slide-left-login .c-menu__items').html(`
          Welcome back ${data.user.firstName}!<br>
          Try not to break it this time!
          `);
        if(data.token) self.setToken(data.token);
        self.loggedInState();
      } else {
        console.log('something went wrong when logining in user. data returned: ', data);
      }
    });
  };

  this.registerForm = function(e){
    const self = this;
    e.preventDefault();
    const method = $(e.target).attr('method');
    const data = $(e.target).serialize();
    const url = `${this.serverUrl}${$(e.target).attr('action')}`;

    this.ajaxRequest(url, method, data, data => {
      if(data.user.firstName) {
        $('#c-menu--slide-left-register .c-menu__items').html(`
          Welcome ${data.user.firstName}!<br>
          OMFG, ${data.user.favouriteLine} is my favourite line to!
          `);
        if(data.token) self.setToken(data.token);
        self.loggedInState();
      } else {
        console.log('something went wrong when registering user. data returned: ', data);
      }
    });
  };

  this.newTrain = function(){
    this['train' + this.trainCounter] = new Train();
  };

  this.getStopPointsObject = function(){
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

  this.loggedOutState = function(){
    $('.loggedOut').show();
    $('.loggedIn').hide();
  };

  this.loggedInState = function(){
    $('.loggedOut').hide();
    $('.loggedIn').show();
  };

  this.init = function(){
    if(this.getToken()) {
      this.loggedInState();
    } else {
      this.loggedOutState();
    }
    this.stopPointsObject = this.getStopPointsObject();
    tubeMap.init();
    $('.submit.train').on('click', this.newTrain.bind(this));
    $('form.register').on('submit', this.registerForm.bind(this));
    $('form.login').on('submit', this.loginForm.bind(this));
    $('#logout').on('click', this.logout.bind(this));
  };
}

const tubeApp = new App();

$(tubeApp.init.bind(tubeApp));
