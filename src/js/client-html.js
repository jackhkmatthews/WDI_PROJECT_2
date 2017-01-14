const html = html || {};

html.getData = function() {
  html.stopPointsArray = html.getstopPointsArray(html.init);
};

html.getstopPointsArray = function getstopPointsArray(callback){
  const array = [];
  $.get(`http://localhost:3000/api/stopPoints`)
    .done(data => {
      const stations = data.stopPoints;
      $.each(stations, (index, station) => {
        const element = {
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

html.init = function(stopPointsArray){
  html.stopPointsArray = stopPointsArray;
  $('body').append(html.returnUi);
  html.getLinesArray();
  html.populateUi();
};

html.returnUi = function(){
  return `<div id="floating-panel">
  <b>Line: </b>
  <select id="line">
  </select>
  <b>Start: </b>
  <select id="origin"></select>
  <b>End: </b>
  <select id="destination"></select>
  <button>Submit</button>
  </div>
  <div id="map"></div>`;
};

html.getLinesArray = function(){
  const lineIds =[];
  const lineNames = [];
  html.linesArray = [];
  $(html.stopPointsArray).each((i, stopPoint) => {
    if(lineIds.indexOf(stopPoint.lineId) === -1){
      lineIds.push(stopPoint.lineId);
    }
    if(lineNames.indexOf(stopPoint.lineName) === -1){
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

html.populateUi = function(){
  $(html.linesArray).each((index, line) => {
    $('#line').append(`
      <option value="${line.lineId}">${line.lineName}</option>
      `);
  });
};

$(html.getData);
