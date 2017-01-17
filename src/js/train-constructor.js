const google = google;

function Map() {

  this.mapCenter = {lat: 51.513568, lng: -0.126688};
  this.mapZoom = 11;

  this.init = function() {
    this.directionsService = new google.maps.DirectionsService;
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: this.mapZoom,
      center: this.mapCenter,
      disableDefaultUI: true
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
  this.departureIndex = 0;

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
    let count = 0;
    this.originIndex += 1;
    this.destinationIndex += 1;
    const intervalId = function intervalId(){
      const countIncriment = self.getCountIncriment(duration, self.animationRefreshRate);
      const interval = setInterval(function() {
        count += countIncriment;
        if (parseFloat(polyline.icons[0].offset.split('%')[0]) > 99) {
          self.removeOldSection(self.pathPolyLine, interval);
          $(`.train${tubeApp.trainCounter - 1}`).remove();
          return console.log('finished journey');
        }
        polyline.icons[0].offset = (count) + '%';
        polyline.set('icons', polyline.icons);
      }, this.animationRefreshRate);
    };
    setTimeout(intervalId, delay);
  };

  this.getDuration = function(response) {
    let durationSecs;
    for (var i = 0; i < response.routes[0].legs[0].steps.length; i++) {
      if (response.routes[0].legs[0].steps[i].travel_mode === 'TRANSIT'){
        durationSecs = response.routes[0].legs[0].steps[i].duration.value;
      }
    }
    return durationSecs * 1000;
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

  this.getPolylinePath = function(routeResponse){
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
    // this.duration = this.getDuration(response);
    console.log(this.duration);
    this.delay = 0;
    this.animateIcon.call(this, this.pathPolyLine, this.duration, this.delay);
  };

  this.googleJourneyRequest = function(callback){
    const self = this;
    self.directionsService.route({
      origin: this.origin,
      destination: this.destination,
      travelMode: 'TRANSIT'
    }, function(response, status){
      if (status === 'OK') {
        console.log('google whole route response: ', response);
        callback.call(self, response);
      }
    });
  };

  this.addTrainTag = function() {
    $(`
      <li class="c-menu__item train train${tubeApp.trainCounter}" style="background-color: ${this.lineColor}">
        <ul>
          <li class="from">From</li>
          <li class="originName">${this.originName}</li>
          <li class="to">To</li>
          <li class="destinationName">${this.destinationName}</li>
        </ul>
      </li>
    `).insertAfter('.c-menu__item:first').hide().slideDown('fast');
  };

  this.loseLastTwoWords = function(string){
    let lastIndex = string.lastIndexOf(' ');
    string = string.substring(0, lastIndex);
    lastIndex = string.lastIndexOf(' ');
    string = string.substring(0, lastIndex);
    return string;
  };

  this.getStationsNextDeparture = function (callback){
    const self = this;
    console.log('this next departure', this);
    const stationName = this.loseLastTwoWords(this.journeyStoppointsNameArray[this.departureIndex]);
    const nextStationId = this.journeyStoppointsIdArray[this.departureIndex];
    $.get(`http://localhost:3000/tfl/StopPoint/${stationName}/Arrivals/${nextStationId}`)
    .done(response => {
      console.log('tfl next departure response:', response);
      if (!response.timeToStation){
        setTimeout(() => {
          return this.getStationsNextDeparture(stationName, nextStationId, callback);
        }, 15000);
      } else {
        self.nextDeparture = response;
        self.duration = self.nextDeparture.timeToStation;
        return console.log('next departure', self.nextDeparture);
      }
    });
  };

  this.getjourneyStoppointsArray = function (origin, destination, callback){
    const idArray = [];
    const nameArray = [];
    $.get(`http://localhost:3000/tfl/Journey/JourneyResults/${origin}/to/${destination}`)
    .done(route => {
      const legs = route.journeys[0].legs;
      let stopPoints = legs[0].path.stopPoints;
      $.each(legs, (index, leg) => {
        if (leg.path.stopPoints.length > stopPoints.length) {
          stopPoints = leg.path.stopPoints;
        }
      });
      nameArray.push(this.originName);
      $.each(stopPoints, (index, stopPoint) => {
        idArray.push(stopPoint.id);
        nameArray.push(stopPoint.name);
      });
      return callback.call(this, idArray, nameArray);
    });
  };

  this.init = function(){
    this.line = $('#line').val();
    this.lineColor = $(`option[value=${this.line}]`).attr('data-color');
    this.origin = $('#origin').val();
    this.originName = $(`option[value="${this.origin}"]:first`).text();
    this.destination = $('#destination').val();
    this.destinationName = $(`option[value="${this.destination}"]:first`).text();
    this.getjourneyStoppointsArray(this.origin, this.destination,
      function(idArray, nameArray){
        this.journeyStoppointsNameArray = nameArray;
        this.journeyStoppointsIdArray = idArray;
        this.getStationsNextDeparture(null);
        this.googleJourneyRequest.call(this, this.departTrain);
      }
    );
    this.addTrainTag.call(this);
    this.directionsService = new google.maps.DirectionsService;
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

  this.ajaxRequest = function(url, method, data, doneCallback, failCallback){
    $.ajax(url, {
      method,
      data
    }).done(data => {
      doneCallback(data);
    }).fail(data => {
      failCallback(data);
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
    function doneCallback(data){
      if(data.user && data.user.firstName) {
        if ($('.c-menu__item.error')) $('.c-menu__item.error').slideUp('fast');
        $('form.login').slideUp('fast');
        const success = $(`
          <li class="c-menu__item success">
            <div class="input-container">
              <h3>Welcome back!</h3>
              </div>
          </li>
        `);
        success.hide();
        $('#c-menu--slide-left-login .c-menu__items').prepend(success);
        setTimeout(function(){
          success.slideDown('fast');
        }, 300);
        if(data.token) self.setToken(data.token);
        self.loggedInState();
      } else {
        console.log('something went wrong when logining in user. data returned: ', data);
      }
    }
    function failCallback(data){
      $(`
        <li class="c-menu__item error">
          <div class="input-container">
            <h3>${data.responseJSON.message}</h3>
            </div>
        </li>
      `).insertBefore('#c-menu--slide-left-login .c-menu__item:first').hide().slideDown('fast');
    }
    this.ajaxRequest(url, method, data, doneCallback, failCallback);
  };

  this.registerForm = function(e){
    const self = this;
    e.preventDefault();
    const method = $(e.target).attr('method');
    const data = $(e.target).serialize();
    const url = `${this.serverUrl}${$(e.target).attr('action')}`;
    function doneCallback(data){
      if(data.user && data.user.firstName) {
        if ($('.c-menu__item.error')) $('.c-menu__item.error').slideUp('fast');
        $('form.register').slideUp('fast');
        const success = $(`
          <li class="c-menu__item success">
            <div class="input-container">
              <h3>Welcome!</h3>
              <p>${data.user.favouriteLine} line ay? One of the greats!</p>
              </div>
          </li>
        `);
        success.hide();
        $('#c-menu--slide-left-register .c-menu__items').prepend(success);
        setTimeout(function(){
          success.slideDown('fast');
        }, 300);
        if(data.token) self.setToken(data.token);
        self.loggedInState();
      } else {
        console.log('something went wrong when logining in user. data returned: ', data);
      }
    }
    function failCallback(data){
      $(`
        <li class="c-menu__item error">
          <div class="input-container">
            <h3>Please try again.</h3>
            </div>
        </li>
      `).insertBefore('#c-menu--slide-left-register .c-menu__item:first').hide().slideDown('fast');
    }
    this.ajaxRequest(url, method, data, doneCallback, failCallback);
  };

  this.newTrain = function(e){
    if (e) e.preventDefault;
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
    $('.c-menu__item.success').remove();
    $('form.login').show();
    $('form.register').show();
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
