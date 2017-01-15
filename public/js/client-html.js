'use strict';

var tubeLineColors = ['#95CDBA', '#0098D4', '#A0A5A9', '#00782A', '#9B0056', '#000000', '#003688', '#E32017', '#F3A9BB', '#B36305'];

var html = html || {};

html.getData = function () {
  html.stopPointsArray = html.getstopPointsArray(html.init);
};

html.getstopPointsArray = function getstopPointsArray(callback) {
  var array = [];
  $.get('http://localhost:3000/api/stopPoints').done(function (data) {
    var stations = data.stopPoints;
    $.each(stations, function (index, station) {
      var element = {
        commonName: station.commonName,
        lat: parseFloat(station.lat),
        lng: parseFloat(station.lng),
        id: station.id,
        lineId: station.lineId,
        lineName: station.lineName
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
  var lineIds = [];
  var lineNames = [];
  html.linesArray = [];
  $(html.stopPointsArray).each(function (i, stopPoint) {
    if (lineIds.indexOf(stopPoint.lineId) === -1) {
      lineIds.push(stopPoint.lineId);
    }
    if (lineNames.indexOf(stopPoint.lineName) === -1) {
      lineNames.push(stopPoint.lineName);
    }
  });
  for (var i = 0; i < lineIds.length; i++) {
    html.linesArray.push({
      lineId: lineIds[i],
      lineName: lineNames[i],
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
  console.log('value:', lineId);
  var stopPoints = [];
  $(html.stopPointsArray).each(function (index, stopPoint) {
    if (stopPoint.lineId === lineId) {
      stopPoints.push(stopPoint);
    }
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