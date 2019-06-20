// Creating our initial map object
// We set the longitude, latitude, and the starting zoom level
// This gets inserted into the div with an id of 'map'
// var myMap = L.map("map1", {
//   center: [45.52, -122.67],
//   center: [29.76, -95.37],
//   zoom: 17
// });

// function getColor(d) {
//   return d > 1000 ? '#800026' :
//          d > 500  ? '#BD0026' :
//          d > 200  ? '#E31A1C' :
//          d > 100  ? '#FC4E2A' :
//          d > 50   ? '#FD8D3C' :
//          d > 20   ? '#FEB24C' :
//          d > 10   ? '#FED976' :
//                     '#FFEDA0';
// }

// function getColor(d) {
//   return d > 3200 ? '#800026' :
//          d > 1600  ? '#BD0026' :
//          d > 800  ? '#E31A1C' :
//          d > 400  ? '#FC4E2A' :
//          d > 200   ? '#FD8D3C' :
//          d > 100   ? '#FEB24C' :
//          d > 50   ? '#FED976' :
//                     '#FFEDA0';
// }

var geojson;
var myMap = L.map('map1').setView([25, -25], 4);
// var myMap = L.map('map1').setView([37.8, -96], 4);


function getColor(d,maxparam){ 
  var color = d3.scaleLinear()
    .domain([0, maxparam/64 , maxparam/32,maxparam/16, maxparam/8,maxparam/4,maxparam/2,maxparam])
    .range(["lightgray", '#FED976', '#FEB24C','#FD8D3C','#FC4E2A','#E31A1C','#BD0026','#800026']);
  return color(d)
}

// Defining Listeners
// #################################################################################################

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
  }

  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);

  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
  });
}

// #################################################################################################

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of country names to populate the dropdown
  d3.json("/countries").then((countryNames) => {
    countryNames.forEach((country) => {
      selector
        .append("option")
        .text(country)
        .property("value", country);
    });

    var selector1 = d3.select("#selDataset1");

    graphNames = ["Total Enerergy Consumption", "gdp", "emissions"];
    graphNames.forEach((graph) => {
      selector1
        .append("option")
        .text(graph)
        .property("value", graph);
    })

    // Use the first sample from the list to build the initial plots
    const firstCountry = countryNames[0];
    const firstGraph = graphNames[0];

    // buildCharts(firstCountry);
    buildCharts(firstCountry, firstGraph);
    buildMetadata(firstCountry);    
  });
}

// Initialize the dashboard
init();

// #################################################################################################

// Adding a tile layer (the background map image) to our map
// We use the addTo method to add objects to our map
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 100,  
  id: "mapbox.light",
  accessToken: API_KEY
}).addTo(myMap);

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Using country.js
// console.log(countryData.features[100].properties.ADMIN)

L.geoJson(countryData).addTo(myMap);

param = "TotEnerCon"
maxparam = 3200;
unit = "Million Tonnes of Oil Equivalent"

// param = "GDP";
// maxparam = 20000;
// unit = "Bi US$"

// param = "Emmisions"
// maxparam = 10000;
// unit = "Million Tonnes"

// L.geoJson(countryData, {style: style}).addTo(myMap)


function optionChanged(country,newGraph) {
  switch (newGraph) {
    case "poverty":
      var param = "TotEnerCon"
      var maxparam = 3200;
      var unit = "Million Tonnes of Oil Equivalent";
      break;
    case "age":
      var param = "GDP";
      var maxparam = 20000;
      var unit = "Bi US$";
      break;
    case "income":
      var param = "Emmisions"
      var maxparam = 10000;
      var unit = "Million Tonnes"
      break;
  }
}

geojson = L.geoJson(countryData, {
  style: function(feature){     
      return {
          fillColor: getColor(feature.properties[param],maxparam),
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
      }
    },
  onEachFeature: onEachFeature
}).addTo(myMap);


var info = L.control();

info.onAdd = function(map){
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function(props){
    this._div.innerHTML = '<h4>'+ param + '</h4>' +  (props ?
        '<b>' + props.ADMIN + '</b><br />' + props[param] + ' ' + unit
        : 'Hover over a country');
};

info.addTo(myMap);


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, maxparam/64 , maxparam/32,maxparam/16, maxparam/8,maxparam/4,maxparam/2,maxparam],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1,maxparam) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);




// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


// var queryUrl = "https://pkgstore.datahub.io/core/geo-countries/countries/archive/23f420f929e0e09c39d916b8aaa166fb/countries.geojson"

// d3.json(queryUrl,function(data){
//  data.forEach(feature => {
//     console.log(feature.properties)
//   });
// })

// d3.json(queryUrl,function(data){  
//   L.geoJson(data,function(feature){
//     // console.log(feature.properties.name)
//   }).addTo(myMap)
// })


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Using us-states.js
// L.geoJson(statesData).addTo(myMap);
// L.geoJson(statesData, {style: style}).addTo(myMap)
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%