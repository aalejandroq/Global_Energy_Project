// Creating our initial map object
// We set the longitude, latitude, and the starting zoom level
// This gets inserted into the div with an id of 'map'
// var myMap = L.map("map1", {
//   center: [45.52, -122.67],
//   center: [29.76, -95.37],
//   zoom: 17
// });

var geojson;
// var myMap = L.map('map1').setView([25, -25], 4);
// var myMap = L.map('map1').setView([37.8, -96], 4);


function getColor(d,maxparam){ 
  var color = d3.scaleLinear()
    // .domain([0, maxparam/64 , maxparam/32,maxparam/16, maxparam/8,maxparam/4,maxparam/2,maxparam])
    // .range(["lightgray", '#FED976', '#FEB24C','#FD8D3C','#FC4E2A','#E31A1C','#BD0026','#800026']);
    .domain([0, maxparam/(1.5^7), maxparam/(1.5^6) , maxparam/(1.5^5), maxparam/(1.5^4), maxparam/(1.5^3),maxparam/(1.5^2),maxparam/(1.5),maxparam])
    .range(["white", "#b2182b",'#FED976', '#FEB24C','#FD8D3C','#FC4E2A','#E31A1C','#BD0026','#800026']);
    // .range([["#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac"]])
  return color(d)
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of country names to populate the dropdown
  // d3.json("/countries").then((countryNames) => {
  //   countryNames.forEach((country) => {
  //     selector
  //       .append("option")
  //       .text(country)
  //       .property("value", country);
  //   });

    graphYears = [2017,2016,2015,2014,2013,2012,2011,2010,2009,2008,2007,2006,2005,2004,2003,2002,2001,2000,1999,1998,1997,1996,1995,1994,1993,1992,1991,1990]

    graphYears.forEach((graph) => {
      selector
        .append("option")
        .text(graph)
        .property("value", graph);
    })

    var selector1 = d3.select("#selDataset1");

    graphNames = ["Total Energy Consumption", "gdp", "emissions"];
    graphNames.forEach((graph) => {
      selector1
        .append("option")
        .text(graph)
        .property("value", graph);
    })

    // Use the first sample from the list to build the initial plots
    const firstYear = graphYears[0];
    const firstGraph = graphNames[0];

    var param = "TotEnerCon"
    var maxparam = 3200;
    var unit = "Million Tonnes of Oil Equivalent"
    var pos = parseInt(1990)-parseInt(1990)
    
    // console.log(pos)
    // console.log(param)

    // geojson = buildMap(countryData,param,pos,maxparam,unit,0)
    myMap = buildMap(countryData,param,pos,maxparam,unit,0)
   
}

// Initialize the dashboard
init();

function optionChanged(newYear,newGraph) {
  switch (newGraph) {
    case "Total Energy Consumption":
      var param = "TotEnerCon"      
      var maxparam = 3200;
      var unit = "Million Tonnes of Oil Equivalent";
      break;
    case "gdp":
      var param = "GDP";
      var maxparam = 20000;
      var unit = "Bi US$";
      break;
    case "emissions":
      var param = "Emmisions"
      var maxparam = 10000;
      var unit = "Million Tonnes"
      break;
  }

  var pos = parseInt(newYear)-1990

  if (myMap && myMap.remove){
    myMap.off();
    myMap.remove();
  }
  myMap = buildMap(countryData,param,pos,maxparam,unit,1)
  // geojson = buildMap(countryData,param,pos,maxparam,unit,1)
  // Re_buildMap(countryData,param,pos,maxparam,unit)
}

function updateRangeInput(elem) {
  $(elem).next().val($(elem).val());
}

function buildMap(countryData, param, pos, maxparam, unit,flag) {

  // var myMap = L.map('map1').setView([25, -25], 4);
  // myMap.setZoom(2.5)

  var myMap = L.map("map1", {
    center: [
        10.5994, -7.6731
    ],
    zoom: 2.75
  })
  
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

  // Adding a tile layer (the background map image) to our map
  // We use the addTo method to add objects to our map
  L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 10,
    id: "mapbox.light",
    accessToken: API_KEY
  }).addTo(myMap);

  L.geoJson(countryData).addTo(myMap);  

  geojson = L.geoJson(countryData, {
    style: function (feature) {
      return {
        fillColor: getColor(feature.properties[param][pos], maxparam),
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

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
  };

  // method that we will use to update the control based on feature properties passed
  info.update = function (props) {
    this._div.innerHTML = '<h4>' + param + '</h4>' + (props ?
      '<b>' + props.ADMIN + '</b><br />' + props[param][pos] + ' ' + unit
      : 'Hover over a country');
  };

  info.addTo(myMap);

  var legend = L.control({ position: 'topleft' });

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, maxparam / 64, maxparam / 32, maxparam / 16, maxparam / 8, maxparam / 4, maxparam / 2, maxparam],
      labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1, maxparam) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(myMap);

  // return geojson
  return myMap
}

function Re_buildMap(countryData, param, pos, maxparam, unit) {

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

  console.log(param,pos)
    
    geojson.eachLayer(function(layer){
      val = layer.feature.properties[param][pos]
      // console.log(param,pos,val)
      layer.setStyle({
        fillColor: getColor(val, maxparam),       
      })     
    })

    L.geoJson(countryData, {
      onEachFeature: onEachFeature
    })

    var item = document.getElementsByClassName('info legend')   
    grades = [0, maxparam / 64, maxparam / 32, maxparam / 16, maxparam / 8, maxparam / 4, maxparam / 2, maxparam];
    // loop through our density intervals and generate a label with a colored square for each interval
    item[0].innerHTML = ""
    for (var i = 0; i < grades.length; i++) {
      item[0].innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1, maxparam) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
     
     var info = document.getElementsByClassName('info');
    console.log(info)
     // method that we will use to update the control based on feature properties passed
    console.log(param,pos)

     info.update = function (props) {
       this._div.innerHTML = '<h4>' + param + '</h4>' + (props ?
         '<b>' + props.ADMIN + '</b><br />' + props[param][pos] + ' ' + unit
         : 'Hover over a country');
     };
}