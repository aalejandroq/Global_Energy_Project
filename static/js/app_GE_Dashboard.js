//BUILDING GAUGES FUNCTION
function buildMetadata(country) {

  d3.json(`/rank/${country}`).then(function (data) {

    buildGauge(data.Total, "gauge", "<b>Consumed Energy</b>"),
      buildGauge(data.GDP, "gauge_1", "<b>GDP</b>"),
      buildGauge(data.Electricity, "gauge_2", "<b>Consumed Electricity</b>"),
      buildGauge(data.CO2_emissions, "gauge_3", "<b>CO2 Emissions</b>");
  })
}





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
    text: ['45-50', '40-45', '35-40', '30-35', '25-30', '20-25', '15-20', '10-15', '5-10', '0-5', ''],
    textinfo: 'text',
    textposition: 'inside',
    marker: {
      colors: ['rgba(255, 127, 14, .4)', 'rgba(230, 126, 32, .4)',
        'rgba(205, 125, 50, .4)', 'rgba(180, 124, 69, .4)', 'rgba(155, 123, 87, .4)',
        'rgba(130, 122, 106, .4)', 'rgba(105, 121, 124, .4)',
        'rgba(80, 120, 143, .4)', 'rgba(55, 119, 161, .4)', 'rgba(31, 119, 180, .4)',
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

    title: `${title}`,
    height: 325,
    width: 325,

    margin: {'l':0 , 'r': 10, 't': 80, 'b': 0},
    
    xaxis: {
      
      zeroline: false, showticklabels: false,
      showgrid: false, range: [-1, 1], fixedrange: true
    },
    yaxis: {
      zeroline: false, showticklabels: false,
      showgrid: false, range: [-1, 1], fixedrange: true
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


      var layout = {
        title: `${country} - Fossil Fuel Consumption by Sector`,
        xaxis: { title: 'Year' },
        yaxis: { title: 'Consumed Energy (MTOE)' }
      };

      var all_traces = [trace1, trace2, trace3];
    } 
    
    else if (graph === "electricity") {
    
          var trace1 = {
            x: data.year,
            y: data.electricity_consumption,
            name: 'Non-Renewables',
            fill: 'tonexty',
            type: 'scatter',
            mode: 'none',
            stackgroup: 'one'
          };
    
          var trace2 = {
            x: data.year,
            y: data.electricity_renewables,
            name: 'Renewables',
            fill: 'tonexty',
            type: 'scatter',
            mode: 'none',
            stackgroup: 'one'
          };
    
          var layout = {
            title: `${country} - Electricity Consumption`,
            xaxis: { title: 'Year' },
            yaxis: { title: 'Consumed Electricity (TWh)' }
          };
    
          var all_traces = [trace1, trace2];

    }

    else {


    var trace1 = {
        x: data.year,
        y: data.agriculture,
        name: 'Agriculture',
        fill: 'tonexty',
        type: 'scatter',
        mode: 'none',
        stackgroup: 'one'
      };

      var trace2 = {
        x: data.year,
        y: data.mining,
        name: 'Mining',
        fill: 'tonexty',
        type: 'scatter',
        mode: 'none',
        stackgroup: 'one'
      };

      var trace3 = {
        x: data.year,
        y: data.manufacturing,
        name: 'Manufacturing',
        fill: 'tonexty',
        type: 'scatter',
        mode: 'none',
        stackgroup: 'one'
      };

      var trace4 = {
        x: data.year,
        y: data.construction,
        name: 'Construction',
        fill: 'tonexty',
        type: 'scatter',
        mode: 'none',
        stackgroup: 'one'
      };

      var trace5 = {
        x: data.year,
        y: data.wholesale,
        name: 'Wholesale',
        fill: 'tonexty',
        type: 'scatter',
        mode: 'none',
        stackgroup: 'one'
      };

      var trace6 = {
        x: data.year,
        y: data.transport,
        name: 'Transport',
        fill: 'tonexty',
        type: 'scatter',
        mode: 'none',
        stackgroup: 'one'
      };

      var trace7 = {
        x: data.year,
        y: data.other,
        name: 'Other',
        fill: 'tonexty',
        type: 'scatter',
        mode: 'none',
        stackgroup: 'one'
      };

      var layout = {
        title: `${country} - GDP by Economic Sector`,
        xaxis: { title: 'Year' },
        yaxis: { title: 'GDP (2005 price $)' }
      };

      var all_traces = [trace1, trace2, trace3, trace4, trace5, trace6, trace7];

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

    graphNames = ["consumption", "electricity", "gdp"];
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