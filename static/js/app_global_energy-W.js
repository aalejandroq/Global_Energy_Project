// function buildMetadata(sample) {

//   // @TODO: Complete the following function that builds the metadata panel

//   // Use `d3.json` to fetch the metadata for a sample
//   d3.json(`metadata/${sample}`).then(function(data) {

//     // Use d3 to select the panel with id of `#sample-metadata`
//     var sample_metadata = d3.select("#sample-metadata");

//     // Use `.html("") to clear any existing metadata
//     sample_metadata.html("");

//     // Use `Object.entries` to add each key and value pair to the panel
//     // Hint: Inside the loop, you will need to use d3 to append new
//     // tags for each key-value in the metadata.
//     Object.entries(data).forEach(function ([key, value]) {
//       var row = sample_metadata.append("p");
//       row.text(`${key}: ${value} \n`);
//     });
//   });
// }

// function buildCharts(country) {
function buildCharts(country,graph) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(`${graph}/${country}`).then(function(data) {

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

          var all_traces = [trace1, ];
      }



    Plotly.newPlot('temp-stacked-lineChart', all_traces, layout);

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

    graphNames = ["consumption","gdp"];
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
    buildCharts(firstCountry,firstGraph);
    // buildMetadata(firstSample);
    // buildGauge(firstSample);
  });
}

function optionChanged(newCountry,newGraph) {
  // Fetch new data each time a new sample is selected
//   buildCharts(newCountry);
  buildCharts(newCountry,newGraph);
//   buildMetadata(newSample);
//   buildGauge(newSample);
}

// Initialize the dashboard
init();