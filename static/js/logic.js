// Store the API endpoint inside earthquakeUrl
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(earthquakeUrl, function(data) {
  // Once we get a response, send the data.features object to the createEQVisualization function
  createEQVisualization(data.features);
});

function createEQVisualization(earthquakeData) {


  // Display a popup describing the place and time of the earthquake for each feature.
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<h4> Magnitude: " + feature.properties.mag +"</h4>");
  }


// Define a function for Circle Color Base on Criteria. The Color Scale is base of the 7 colors of a Rainboy ROY G BIV
function quakeColor(qCcolor) {
    switch(true) {
        case (0 <= qCcolor && qCcolor <= 1.0):
          return "Red";
        case (1.0 <= qCcolor && qCcolor <= 2.0):
            return "Orange";
        case (2.0 <= qCcolor && qCcolor<= 3.0):
          return "Yellow";
        case (3.0 <= qCcolor && qCcolor<= 4.0):
            return "Green";
        case (4.0 <= qCcolor && qCcolor<= 5.0):
            return "Blue";
        case (5.0 <= qCcolor && qCcolor <= 6.0):
          return "Indigo";
        default:
          return "Violet";
    }
  }
//   Create a circle function

function drawCircle(features, latlng){
    var CircleOptions = {
        radius: features.properties.mag * 8,
        fillColor: quakeColor(features.properties.mag),
        color: quakeColor(features.properties.mag),
        opacity: 1.0,
        fillOpacity: .5

    }
    return L.circleMarker(latlng, CircleOptions)
}
  // Create a GeoJSON layer and run the onEachFeature function once for each earthquake feature.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: drawCircle
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and Satellite layers using the Mapbox API
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var Satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
  });


  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  });
  // Define baseMaps object 
  var baseMaps = {
    "Street Map": streetmap,
    "Light Map": lightmap,
    "Satellite Map": Satellite
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create a map, giving it the streetmap and earthquakes layers 
  var myMap = L.map("mapid", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  function getColor(d){
    return d > 5 ? "#4B0082":
    d  > 4 ? "#0000FF":
    d > 3 ? "#008000":
    d > 2 ? "#FFFF00":
    d > 1 ? "#FFA500":
             "#FF0000";
  }
  

// Create a legend to display information about map
var info = L.control({
    position: "bottomright"
  });

  info.onAdd = function(myMap) {
    var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 1, 2, 3, 4, 5],
    labels = [];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
  return div;
}

// Add the info legend to the map
info.addTo(myMap);

  // Create a layer control
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}

