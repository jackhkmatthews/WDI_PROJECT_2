const google = google;

const markers = [];

//why do we do this?
const googleMap = googleMap || {};

googleMap.addInfoWindowForCamera = function(camera, marker) {
  google.maps.event.addListener(marker, 'click', () => {
    if (typeof this.infoWindow !== 'undefined') this.infoWindow.close();
    console.log('clicked');
    this.infoWindow = new google.maps.InfoWindow({
      content: `<img src="http://www.tfl.gov.uk/tfl/livetravelnews/trafficcams/cctv/${ camera.file }"><p>${ camera.location }</p>`
    });
    this.infoWindow.open(this.map, marker);
  });
};

googleMap.createMarkerForCamera = function(index, camera){
  const latlng = new google.maps.LatLng(camera.lat, camera.lng);
  const marker = new google.maps.Marker({
    position: latlng,
    map: this.map
  });
  markers.push(marker);
  this.addInfoWindowForCamera(camera, marker);
};

//how to bind to an each function
googleMap.loopThroughCameras = function(data) {
  $.each(data.cameras, (index, camera) => {
    googleMap.createMarkerForCamera(index, camera);
  });
  var markerCluster = new MarkerClusterer(googleMap.map, markers,
      {imagePath: '../images/m'});
};

googleMap.getCameras = function(){
  //no need to pass data to loopThroughCameras as dont automatically in ajax
  $.get('http://localhost:3000/cameras').done(this.loopThroughCameras);
};

googleMap.mapSetup = function(){
  const canvas = document.getElementById('map-canvas');

  const mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(51.506178,-0.088369),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  this.map = new google.maps.Map(canvas, mapOptions);
  this.getCameras();

};

$(googleMap.mapSetup.bind(googleMap));

//add custom marker
//animations so markers drop onto page
//make markers drop one by one
