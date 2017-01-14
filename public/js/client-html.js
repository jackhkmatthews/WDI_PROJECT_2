'use strict';

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
  $('body').append(html.returnUi);
  html.getLinesArray();
  html.populateUi();
};

html.returnUi = function () {
  return '<div id="floating-panel">\n  <b>Line: </b>\n  <select id="line">\n  </select>\n  <b>Start: </b>\n  <select id="origin"></select>\n  <b>End: </b>\n  <select id="destination"></select>\n  <button>Submit</button>\n  </div>\n  <div id="map"></div>';
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
      lineName: lineNames[i]
    });
  }
};

html.populateUi = function () {
  $(html.linesArray).each(function (index, line) {
    $('#line').append('\n      <option value="' + line.lineId + '">' + line.lineName + '</option>\n      ');
  });
};

$(html.getData);