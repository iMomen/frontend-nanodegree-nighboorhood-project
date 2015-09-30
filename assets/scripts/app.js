var myLocations = [{
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
}, {
  name: "Perdana Botanical Garden",
  street: "Jalan Raja Abdullah",
  zip: "50300",
  city: "Kuala Lumpur",
  latlng: new google.maps.LatLng(3.143, 101.68466),
  marker: null
}, {
  name: "Desa Park City",
  street: "The Waterfront",
  zip: "52200",
  city: "Kuala Lumpur",
  latlng: new google.maps.LatLng(3.18532, 101.6319984),
  marker: null
}, {
  name: "Restoran Kin Kin",
  street: "40, Jalan Dewan Sultan Sulaiman, Kampung Baru",
  zip: "50300",
  city: "Kuala Lumpur",
  latlng: new google.maps.LatLng(3.1606721, 101.6982911),
  marker: null
}, {
  name: "VCR",
  street: "2, Jalan Galloway, Bukit Bintang",
  zip: "50150",
  city: "Kuala Lumpur",
  latlng: new google.maps.LatLng(3.143182, 101.705589),
  marker: null
}, {
  name: "Aunty Nat",
  street: "7, Jalan Sri Hartamas 7, Taman Sri Hartamas",
  zip: "50480",
  city: "Kuala Lumpur",
  latlng: new google.maps.LatLng(3.1571721, 101.6503946),
  marker: null
}];

var AppViewModel = function() {
  var self = this;
  var map;
  var service;
  var infowindow;
  self.points = ko.observableArray(myLocations);

  var mapCenter = new google.maps.LatLng(3.10048, 101.42577);

  var markersArray = [];

  function initialize() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: mapCenter,
      zoom: 11
    });

    var list = (document.getElementById('list'));
    map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(list);
    var input = (document.getElementById('pac-input'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var autocomplete = new google.maps.places.Autocomplete(input);
    var searchBox = new google.maps.places.SearchBox((input));

    google.maps.event.addListener(searchBox, 'places_changed', function() {
      var bounds = new google.maps.LatLngBounds();
      map.fitBounds(bounds);
    });

    infoWindow = new google.maps.InfoWindow();
    var place;
    var i;

    for (i = 0; i < self.points().length; i++) {
      place = self.points()[i];
      createMarker(place);
    }

  }

  function createMarker(place) {
    var marker = new google.maps.Marker({
      map: map,
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      name: place.name.toLowerCase(),
      position: place.latlng,
      zip: place.zip,
      animation: google.maps.Animation.DROP
    });

    var contentString = '<div style="font-weight: bold">' + place.name + '</div><div>' + place.city + '</div>';

    google.maps.event.addListener(marker, 'click', function() {
      infoWindow.setContent(contentString);
      infoWindow.open(map, this);
      map.panTo(marker.position);
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null);
      }, 1450);
    });

    markersArray.push(marker);
    return marker;
  }

  self.clickOnListItem = function(place) {

    var marker;

    for (var e = 0; e < markersArray.length; e++) {
      if (place.zip === markersArray[e].zip) {
        marker = markersArray[e];
        break;
      }
    }
    map.panTo(marker.position);

    setTimeout(function() {
      var contentString = '<div style="font-weight: bold">' + place.name + '</div><div>' + place.city + '</div>';
      infoWindow.setContent(contentString);
      infoWindow.open(map, marker);
      marker.setAnimation(google.maps.Animation.DROP);
    }, 300);

  };

  self.searchTerm = ko.observable('');

  self.search = ko.computed(function() {
    return ko.utils.arrayFilter(self.points(), function(point) {
      return (point.name.toLowerCase().indexOf(self.searchTerm().toLowerCase()) >= 0);
    });
  });

  google.maps.event.addDomListener(window, 'load', initialize);
}

ko.applyBindings(new AppViewModel());
