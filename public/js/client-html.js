'use strict';

var tubeLineColors = ['#B36305', '#E32017', '#ffce00', '#00782A', '#d799af', '#A0A5A9', '#9B0056', '#000000', '#003688', '#0098D4', '#95CDBA'];

var tubeLineIds = ['bakerloo', 'central', 'circle', 'district', 'hammersmith-city', 'jubilee', 'metropolitan', 'northern', 'piccadilly', 'victoria', 'waterloo-city'];

var tubeLineNames = ['Bakerloo', 'Central', 'Circle', 'District', 'Hammersmith & City', 'Jubilee', 'Metropolitan', 'Northern', 'Piccadilly', 'Victoria', 'Waterloo & City'];

var html = html || {};

html.getData = function () {
  html.stopPointsArray = html.getstopPointsArray(html.init);
};

html.getstopPointsArray = function getstopPointsArray(callback) {
  console.log('inside getstopPointsArray function');
  var array = [];
  console.log('get request URL:', window.location.origin + '/api/stopPoints');
  $.get(window.location.origin + '/api/stopPoints').done(function (data) {
    console.log('ajax request data:', data);
    var stations = data.stopPoints;
    $.each(stations, function (index, station) {
      var element = {
        commonName: station.commonName,
        lat: parseFloat(station.lat),
        lng: parseFloat(station.lng),
        id: station.id,
        lineIds: station.lineIds,
        lineNames: station.lineNames
      };
      array.push(element);
    });
    return callback(array);
  });
};

html.init = function (stopPointsArray) {
  html.stopPointsArray = stopPointsArray;
  html.getLinesArray();
  html.populateLineSelect();
};

html.getLinesArray = function () {
  html.linesArray = [];
  for (var i = 0; i < tubeLineIds.length; i++) {
    html.linesArray.push({
      lineId: tubeLineIds[i],
      lineName: tubeLineNames[i],
      lineColor: tubeLineColors[i]
    });
  }
};

html.populateLineSelect = function () {
  $(html.linesArray).each(function (index, line) {
    $('#line').append('\n      <option value="' + line.lineId + '" data-color="' + line.lineColor + '">' + line.lineName + '</option>\n      ');
  });
  $('#line').on('change', html.populateStopPointSelects);
};

html.populateStopPointSelects = function (e) {
  var lineId = $(e.target).val();
  var stopPoints = [];
  $(html.stopPointsArray).each(function (index, stopPoint) {
    $(stopPoint.lineIds).each(function (index, stopPointlineId) {
      if (stopPointlineId === lineId) {
        stopPoints.push(stopPoint);
      }
    });
  });
  html.populateStopPointSelect(stopPoints, '#origin');
  html.populateStopPointSelect(stopPoints, '#destination');
};

html.populateStopPointSelect = function (stopPoints, jquerySelector) {
  $(jquerySelector).html('');
  $(stopPoints).each(function (index, stopPoint) {
    $(jquerySelector).append('\n      <option value="' + stopPoint.lat + ', ' + stopPoint.lng + '">' + stopPoint.commonName + '</option>\n      ');
  });
};

$(html.getData);