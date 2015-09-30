var map;
function initMap() {

var map = new google.maps.Map(document.getElementById('map'), {
  center: {lat: 41, lng: 25},
  zoom: 5,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var myPlaces = [
    {lat: 44.481476, lng: 18.137286},
    {lat: 41.385064, lng: 2.173403},
    {lat: 41.008238, lng: 28.978359},
    {lat: 34.802075, lng: 38.996815},
    {lat: 39.074208, lng: 21.824312}
  ]
  for (var i = 0; i < myPlaces.length; i++) {
    var marker = new google.maps.Marker({
    position: myPlaces[i],
    map: map,
    title: 'Hello World!',
    animation: google.maps.Animation.DROP
  });
  }

  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
}
