// A list of my prefered locations
var myLocations = [{
  name: "Alexis Bangsar",
  zip: "59100",
  address: "29 Jalan Telawi 3",
  latlng: new google.maps.LatLng(3.13186, 101.67098),
  marker: null
}, {
  name: "Bangsar Village Shopping Centre",
  zip: "59101",
  address: "Kuala Lumpur",
  latlng: new google.maps.LatLng(3.13243, 101.67046),
  marker: null
}, {
  name: "Damansara Heights",
  zip: "50490",
  address: "Kuala Lumpur",
  latlng: new google.maps.LatLng(3.15219, 101.67090),
  marker: null
}, {
  name: "Perdana Botanical Garden",
  address: "Jalan Raja Abdullah",
  zip: "50300",
  latlng: new google.maps.LatLng(3.143, 101.68466),
  marker: null
}, {
  name: "Desa Park City",
  address: "The Waterfront",
  zip: "52200",
  latlng: new google.maps.LatLng(3.18532, 101.6319984),
  marker: null
}, {
  name: "Restoran Kin Kin",
  address: "40, Jalan Dewan Sultan Sulaiman, Kampung Baru",
  zip: "50300",
  latlng: new google.maps.LatLng(3.1606721, 101.6982911),
  marker: null
}, {
  name: "VCR",
  address: "2, Jalan Galloway, Bukit Bintang",
  zip: "50150",
  latlng: new google.maps.LatLng(3.143182, 101.705589),
  marker: null
}];

// Create infoWindow content
function createContent(place) {
  var infoWindowContent = '<div class="infoWindow-content">';
  infoWindowContent += '<h4 class="title">' + place.name + '</h4>';
  infoWindowContent += '<div class="review"><img class="thumb" src="' + place.image_url + '">';
  infoWindowContent += '<div class="review-content"><p>' + place.snippet_text + '</p>';
  infoWindowContent += '<p><strong>Phone: </strong>' + place.display_phone + '</p>';
  infoWindowContent += '<p><strong>Rating: </strong><img src="' + place.rating_img_url_small + '"></p>';
  infoWindowContent += '</div></div></div>';
  return infoWindowContent;
}

var AppViewModel = function() {
  var self = this;
  var map;
  var marker;
  var service;
  var infowindow;
  var placeLocation = [];
  self.points = ko.observableArray(myLocations);

  var mapCenter = new google.maps.LatLng(3.10048, 101.42577);

  var markersArray = [];

  // initialize the map
  function initialize() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: mapCenter,
      zoom: 11
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();
      if (places.length == 0) {
        return;
      }
      var bounds = new google.maps.LatLngBounds();
      places.forEach(function(place) {
      var placeName = place.formatted_address;
      self.getYelpData(placeName, 10);
      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
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

  // Create marker for every place on myLocations array
  function createMarker(place) {
    marker = new google.maps.Marker({
      map: map,
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      name: place.name.toLowerCase(),
      position: place.latlng,
      zip: place.zip,
      animation: google.maps.Animation.DROP
    });

    google.maps.event.addListener(marker, 'click', function() {
      self.getYelpData(place.address, 1);
      infoWindow.setContent(createContent(place));
      infoWindow.open(map, marker);
      marker.setAnimation(google.maps.Animation.DROP);
      map.panTo(marker.position);
      setTimeout(function() {
        marker.setAnimation(null);
      }, 1450);
    });

    markersArray.push(marker);
    place.marker = marker;
    return marker;
  }

  // Click on list items
  self.clickOnListItem = function(place) {

    var marker;

    for (var e = 0; e < markersArray.length; e++) {
      if (place.zip === markersArray[e].zip) {
        marker = markersArray[e];
        break;
      }
    }
    map.panTo(marker.position);
    self.getYelpData(place.address, 1);
    infoWindow.open(map, marker);
    marker.setAnimation(google.maps.Animation.DROP);
  };

  self.searchTerm = ko.observable('');

  self.search = ko.computed(function() {
    return ko.utils.arrayFilter(self.points(), function(point) {
      return (point.name.toLowerCase().indexOf(self.searchTerm().toLowerCase()) >= 0);
    });
  });

  self.search = ko.computed(function() {
    return ko.utils.arrayFilter(self.points(), function(point) {

      if (point.name.toLowerCase().indexOf(self.searchTerm().toLowerCase()) !== -1) {
        if(point.marker) {
          point.marker.setMap(map);
        }
      } else {
        point.marker.setMap(null);
      }
      return (point.name.toLowerCase().indexOf(self.searchTerm().toLowerCase()) >= 0);
    });
  }, self);

  // Get Yelp data for every location
  self.getYelpData = function(placeAddress, resultsLimit) {
    /**
     * Generates a random number and returns it as a string for OAuthentication
     * @return {string}
     */
    function nonce_generate() {
      return (Math.floor(Math.random() * 1e12).toString());
    }

    var yelp_url = 'http://api.yelp.com/v2/search';

    var parameters = {
      oauth_consumer_key: 'Qo7AHPwy5OEC9xbJ7JQzAw',
      oauth_token: 'EbHuZgmkfI9wFQEdjgzkGaqGiJoNrHvh',
      oauth_nonce: nonce_generate(),
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version: '1.0',
      callback: 'cb',
      term: 'food',
      location: placeAddress,
      limit: resultsLimit
    };

    var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, 'KDOJMIocK-NQF2GTg7gT8i6xroQ', 'rg-VEIPz8m3VJ__85nlxyoNdSoQ');
    parameters.oauth_signature = encodedSignature;

    var settings = {
      url: yelp_url,
      data: parameters,
      cache: true,
      dataType: 'jsonp',
      success: function(results) {
        placeLocation = results.businesses;
        var responseData = results.businesses[0];
        infoWindow.setContent(createContent(responseData));
      },
      error: function(error) {
        console.log(error);
      }
    };

    $.ajax(settings);
  }

  google.maps.event.addDomListener(window, 'load', initialize);
}

ko.applyBindings(new AppViewModel());
