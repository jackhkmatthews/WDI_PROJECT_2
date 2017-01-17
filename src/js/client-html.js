const tubeLineColors = [
  '#B36305',
  '#E32017',
  '#ffce00',
  '#00782A',
  '#F3A9BB',
  '#A0A5A9',
  '#9B0056',
  '#000000',
  '#003688',
  '#0098D4',
  '#95CDBA'
];

const tubeLineIds = [
  'bakerloo',
  'central',
  'circle',
  'district',
  'hammersmith-city',
  'jubilee',
  'metropolitan',
  'northern',
  'piccadilly',
  'victoria',
  'waterloo-city'
];

const tubeLineNames = [
  'Bakerloo',
  'Central',
  'Circle',
  'District',
  'Hammersmith & City',
  'Jubilee',
  'Metropolitan',
  'Northern',
  'Piccadilly',
  'Victoria',
  'Waterloo & City'
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
          lineIds: station.lineIds,
          lineNames: station.lineNames
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
  html.linesArray = [];
  for (var i = 0; i < tubeLineIds.length; i++) {
    html.linesArray.push({
      lineId: tubeLineIds[i],
      lineName: tubeLineNames[i],
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
  const stopPoints = [];
  $(html.stopPointsArray).each((index, stopPoint) => {
    $(stopPoint.lineIds).each((index, stopPointlineId) => {
      if(stopPointlineId === lineId){
        stopPoints.push(stopPoint);
      }
    });
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
