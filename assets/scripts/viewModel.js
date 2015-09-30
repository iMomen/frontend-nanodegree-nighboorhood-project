function initMap() {

  var myLocations = ko.observableArray([{
    name: "Petronas Twin Tower",
    zip: "50088",
    city: "Kuala Lumpur",
    latlng: new google.maps.LatLng(3.15706, 101.71169),
    marker: null
  }, {
    name: "Bangsar Village Shopping Centre",
    zip: "59100",
    city: "Kuala Lumpur",
    latlng: new google.maps.LatLng(3.13243, 101.67046),
    marker: null
  }, {
    name: "Damansara Heights",
    zip: "50490",
    city: "Kuala Lumpur",
    latlng: new google.maps.LatLng(3.15219, 101.67090),
    marker: null
  }]);

  //google maps
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 4.21048,
      lng: 101.97577
    },
    zoom: 8
  });

  var input = document.getElementById('pac-input');
  var autocomplete = new google.maps.places.Autocomplete(input);

  var marker;
  for (var i = 0; i < myLocations.length; i++) {
    marker = new google.maps.Marker({
      position: myLocations()[i].latlng,
      map: map,
      animation: google.maps.Animation.DROP
    });

    myLocations()[i].marker = marker;

  }
}

var AppViewModel = function() {}

ko.applyBindings(new AppViewModel());
