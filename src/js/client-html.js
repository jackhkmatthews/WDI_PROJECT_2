const tubeLineColors = ['#95CDBA', '#0098D4', '#A0A5A9', '#00782A', '#9B0056', '#000000', '#003688', '#E32017', '#F3A9BB', '#B36305'
];

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
  html.getLinesArray();
  html.populateLineSelect();
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
      lineName: lineNames[i],
      lineColor: tubeLineColors[i]
    });
  }
};

html.populateLineSelect = function(){
  $(html.linesArray).each((index, line) => {
    $('#line').append(`
      <option value="${line.lineId}" data-color="${line.lineColor}">${line.lineName}</option>
      `);
  });
  $('#line').on('change', html.populateStopPointSelects);
};

html.populateStopPointSelects = function(e){
  const lineId = $(e.target).val();
  console.log('value:', lineId);
  const stopPoints = [];
  $(html.stopPointsArray).each((index, stopPoint) => {
    if(stopPoint.lineId === lineId){
      stopPoints.push(stopPoint);
    }
  });
  html.populateStopPointSelect(stopPoints, '#origin');
  html.populateStopPointSelect(stopPoints, '#destination');
};

html.populateStopPointSelect = function(stopPoints, jquerySelector){
  $(jquerySelector).html('');
  $(stopPoints).each((index, stopPoint) => {
    $(jquerySelector).append(`
      <option value="${stopPoint.lat}, ${stopPoint.lng}">${stopPoint.commonName}</option>
      `);
  });
};

$(html.getData);
