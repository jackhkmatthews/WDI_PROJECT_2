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
  html.getLinesArray();
  html.populateLineSelect();
};

// html.returnUi = function(){
//   return `<div id="floating-panel">
//   <b>Line: </b>
//   <select id="line">
//   </select>
//   <b>Start: </b>
//   <select id="origin"></select>
//   <b>End: </b>
//   <select id="destination"></select>
//   <button>Submit</button>
//   </div>
//   <div id="map"></div>`;
// };

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

html.populateLineSelect = function () {
  $(html.linesArray).each(function (index, line) {
    $('#line').append('\n      <option value="' + line.lineId + '">' + line.lineName + '</option>\n      ');
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