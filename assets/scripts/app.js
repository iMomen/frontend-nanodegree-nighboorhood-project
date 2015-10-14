// A list of my prefered locations
var myLocations = [{
  name: "Regency Café",
  id: 0,
  address: "17-19 Regency Street Westminster London SW1P 4BY UK",
  latlng: new google.maps.LatLng(51.4940143171, -0.13222007974201),
  marker: null
}, {
  name: "Mother Mash",
  id: 1,
  address: "26 Ganton Street Soho London W1F 7QZ UK",
  latlng: new google.maps.LatLng(51.512935, -0.139414),
  marker: null
}, {
  name: "Kappacasein",
  id: 2,
  address: "Stoney Street London Bridge London SE1 1TL UK",
  latlng: new google.maps.LatLng(51.5050392, -0.09079),
  marker: null
}, {
  name: "Dishoom",
  id: 3,
  address: "5 Stable Street King's Cross",
  latlng: new google.maps.LatLng(51.5360442070729, -0.125712882621315),
  marker: null
}, {
  name: "E Pellicci",
  id: 4,
  address: "332 Bethnal Green Road",
  latlng: new google.maps.LatLng(51.526530005795, -0.0634711028675383),
  marker: null
}, {
  name: "The FRENCHIE",
  id: 5,
  address: "Camden Lock Market",
  latlng: new google.maps.LatLng(51.5410638112118, -0.146470069885254),
  marker: null
}, {
  name: "Pieminister",
  id: 6,
  address: "Gabriel's Wharf",
  latlng: new google.maps.LatLng(51.507581, -0.109933),
  marker: null
}, {
  name: "La Crêperie de Hampstead",
  id: 7,
  address: "77 Hampstead High Street",
  latlng: new google.maps.LatLng(51.555682234589995, -0.17692025446204998),
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
  var infoWindow;
  self.points = ko.observableArray(myLocations);

  var mapCenter = new google.maps.LatLng(51.50735, -0.12776);

  var markersArray = [];

  // initialize the map
  function initialize() {

    map = new google.maps.Map(document.getElementById('map'), {
      center: mapCenter,
      zoom: 9,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: google.maps.ControlPosition.LEFT_BOTTOM
      },
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM,
        style: google.maps.ZoomControlStyle.SMALL
      },
      streetViewControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
      }
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);

    var menuToggle = document.getElementById('menu-toggle');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(menuToggle);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();
      if (places.length === 0) {
        return;
      }
      var bounds = new google.maps.LatLngBounds();
      places.forEach(function(place) {
        var placeName = place.formatted_address;
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
      id: place.id,
      animation: google.maps.Animation.DROP
    });

    google.maps.event.addListener(marker, 'click', function() {
      self.getYelpData(place.address, 1);
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
      if (place.id === markersArray[e].id) {
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
        if (point.marker) {
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
        var responseData = results.businesses[0];
        infoWindow.setContent(createContent(responseData));
      },
      error: function(error) {
        infoWindow.setContent("Yelp is not available at this time");
      }
    };

    $.ajax(settings);
  };

  google.maps.event.addDomListener(window, 'load', initialize);
};

ko.applyBindings(new AppViewModel());
