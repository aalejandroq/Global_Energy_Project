//BUILDING GAUGES FUNCTION
function buildMetadata(country) {

  d3.json(`/rank/${country}`).then(function (data) {
    // console.log(data.Total)
    // console.log(data.GDP)
    // console.log(data.Electricity)
    // console.log(data.Oil)
    buildGauge(data.Total, "gauge", "<b>Total</b> <br> Scrubs per Week"),
      buildGauge(data.GDP, "gauge_1", "GDP"),
      buildGauge(data.Electricity, "gauge_2", "Electricity"),
      buildGauge(data.CO2_emmissions, "gauge_3", "CO2_emissions");
  })
}

// MAKE THE PLOTS RESPONSIVE
// (function () {
//   var d3 = Plotly.d3;
//   var WIDTH_IN_PERCENT_OF_PARENT = 110,
//     HEIGHT_IN_PERCENT_OF_PARENT = 0;

//   var gd3 = d3.selectAll(".responsive-plot")
//     .style({
//       width: WIDTH_IN_PERCENT_OF_PARENT + '%',
//       'margin-left': (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + '%',

//       height: HEIGHT_IN_PERCENT_OF_PARENT + 'vh',
//       'margin-bottom': (100 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + 'vh'
//     });

//   var nodes_to_resize = gd3[0]; //not sure why but the goods are within a nested array
//   window.onresize = function () {
//     for (var i = 0; i < nodes_to_resize.length; i++) {
//       Plotly.Plots.resize(nodes_to_resize[i]);
//     }
//   };

// })();



function buildGauge(level, gauge, title) {
  // Enter a speed between 0 and 180
  // var level = 175;

  // Trig to calc meter point
  // var degrees = 180 - level,
  var degrees = 180 - (level / 5) * (180 / 10),
    radius = .5;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
    pathX = String(x),
    space = ' ',
    pathY = String(y),
    pathEnd = ' Z';
  var path = mainPath.concat(pathX, space, pathY, pathEnd);

  var data = [{
    type: 'scatter',
    x: [0], y: [0],
    marker: { size: 28, color: '850000' },
    showlegend: false,
    name: 'Ranking',
    text: level,
    hoverinfo: 'text+name'
  },
  {
    // values: [10 / 9, 10 / 9, 10 / 9, 10 / 9, 10 / 9, 10 / 9, 10 / 9, 10 / 9, 10 / 9, 10],
    values: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 10],

    rotation: 90,
    text: ['45-50', '40-45', '35-40', '30-35', '25-30', '20-25', '15-20', '10-15', '5-10', '5-0', ''],
    textinfo: 'text',
    textposition: 'inside',
    marker: {
      colors: ['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
        'rgba(170, 202, 42, .5)', 'rgba(14, 130, 0, .5)', 'rgba(110, 157, 22, .5)',
        'rgba(170, 205, 42, .5)', 'rgba(202, 209, 95, .5)',
        'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)', 'rgba(242, 236, 212, .5)',
        'rgba(255, 255, 255, 0)']
    },
    labels: ['45-50', '40-45', '35-40', '30-35', '25-30', '20-25', '15-20', '10-15', '5-10', '5-0', ''],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false
  }];

  var layout = {
    shapes: [{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
    // title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
    title: `${title}`,
    height: 430,
    width: 430,

    margin: {'l':0 , 'r': 10, 't': 80, 'b': 0},
    
    xaxis: {
      
      zeroline: false, showticklabels: false,
      showgrid: false, range: [-1, 1]
    },
    yaxis: {
      zeroline: false, showticklabels: false,
      showgrid: false, range: [-1, 1]
    }
  };

  Plotly.newPlot(gauge, data, layout, {responsive: true });
}


// function buildCharts(country). {
function buildCharts(country, graph) {
  console.log(country)
  console.log(graph)
  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(`${graph}/${country}`).then(function (data) {

    // @TODO: Build a Bubble Chart using the sample data

    if (graph === "consumption") {

      var trace1 = {
        x: data.year,
        y: data.oil_consumption,
        name: 'Oil',
        fill: 'tozeroy',
        type: 'scatter',
        mode: 'none',
        stackgroup: 'one'
      };

      var trace2 = {
        x: data.year,
        y: data.ng_consumption,
        name: 'Natural Gas',
        fill: 'tonexty',
        type: 'scatter',
        mode: 'none',
        stackgroup: 'one'
      };

      var trace3 = {
        x: data.year,
        y: data.coal_consumption,
        name: 'Coal',
        fill: 'tonexty',
        type: 'scatter',
        mode: 'none',
        stackgroup: 'one'
      };

      var trace4 = {
        x: data.year,
        y: data.electricity_consumption,
        name: 'Electricity',
        fill: 'tonexty',
        type: 'scatter',
        mode: 'none',
        stackgroup: 'one'
      };

      var trace5 = {
        x: data.year,
        y: data.electricity_renewables,
        name: 'Renewables',
        fill: 'tonexty',
        type: 'scatter',
        mode: 'none',
        stackgroup: 'one'
      };

      var layout = {
        title: `${country} - Energy Consumption by Sector`,
        xaxis: { title: 'Year' },
        yaxis: { title: 'Consumed Energy (UNITS PLEASE)' }
      };

      var all_traces = [trace1, trace2, trace3, trace4, trace5];
    } else {

      var trace1 = {
        x: data.year,
        y: data.GDP,
        name: 'GDP',
        fill: 'tozeroy',
        type: 'scatter',
        mode: 'none',
        stackgroup: 'one'
      };

      var layout = {
        title: `${country} - GDP`,
        xaxis: { title: 'Year' },
        yaxis: { title: 'GDP (US$)' }
      };

      var all_traces = [trace1];
    }



    Plotly.newPlot('temp-stacked-lineChart', all_traces, layout, { responsive: true });

  });
}

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

    graphNames = ["consumption", "gdp"];
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
    // buildGauge(firstCountry);
  });
}

function optionChanged(newCountry, newGraph) {
  // Fetch new data each time a new sample is selected
  //   buildCharts(newCountry);
  buildCharts(newCountry, newGraph);
  buildMetadata(newCountry);
  // buildGauge(newCountry);
}

// Initialize the dashboard
init();