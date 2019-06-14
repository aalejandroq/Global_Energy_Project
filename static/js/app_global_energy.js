function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  d3.json(`metadata/${sample}`).then(function(data) {

    // Use d3 to select the panel with id of `#sample-metadata`
    var sample_metadata = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    sample_metadata.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(data).forEach(function ([key, value]) {
      var row = sample_metadata.append("p");
      row.text(`${key}: ${value} \n`);
    });
  });
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(`samples/${sample}`).then(function(data) {

    // @TODO: Build a Bubble Chart using the sample data

    // ****************************** Bubble Plot ***********************************
    // ******************************************************************************
    var trace_bubble = {
      x: data.otu_ids,
      y: data.sample_values,
      text: data.otu_labels,

      mode: 'markers',
      marker: {
        size: data.sample_values,
        color: data.otu_ids,
        colorscale: [[0, 'rgb(243, 115, 112)'], [1, 'rgb(20, 60, 144)']],
        showscale: true,
        colorbar: {
          thickness: 15,
          y: 0.5,
          ypad: 0,
            title: 'OTU ID',
            titleside: 'top'
        },
        sizeref: 0.1,
        sizemode: 'area'
      },
    };

    var layout_bubble = {
      title: `Biodiversity of Sample #${sample}`,
      // showlegend: true
      xaxis: {title:'OTU ID'},
      yaxis: {title: 'Number of Sequences Found'}
    };

    var data_bubble = [trace_bubble];
    Plotly.newPlot('bubble', data_bubble, layout_bubble);
    // ******************************************************************************


    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).

    // ******************************** Pie Plot ************************************
    // ******************************************************************************
    var trace_pie = {
      values: data.sample_values.slice(0,10),   // The data coming from 'app.py' MUST be already sorted
      labels: data.otu_ids.slice(0,10),         // by 'sample_value' in descending order
      hovertext: data.otu_labels,
      marker: {colors:['rgba(20, 60, 144, 1)', 'rgba(48, 80, 155, 1)', 'rgba(72, 100, 167, 1)',
      'rgba(96, 121, 179, 1)', 'rgba(120, 141, 191, 1)', 'rgba(144, 161, 201, 1)',
      'rgba(168, 182, 214, 1)', 'rgba(192, 202, 226, 1)', 'rgba(216, 222, 238, 1)',
      'rgba(230, 240, 250, 1)']},
      type: 'pie',
    };

    var layout_pie = {
      title: `Sample #${sample} - Top 10 OTU IDs`,
    };

    var data_pie = [trace_pie];
    Plotly.newPlot('pie', data_pie, layout_pie);  
    // ******************************************************************************

  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");
console.log('hi')
  // Use the list of sample names to populate the select options
  d3.json("/countries").then((countryNames) => {
    countryNames.forEach((country) => {
      selector
        .append("option")
        .text(country)
        .property("value", country);
    });

    // Use the first sample from the list to build the initial plots
    const firstCountry = countryNames[0];
    buildCharts(firstCountry);
    // buildMetadata(firstSample);
    // buildGauge(firstSample);
  });
}

function optionChanged(newCountry) {
  // Fetch new data each time a new sample is selected
  buildCharts(newCountry);
//   buildMetadata(newSample);
//   buildGauge(newSample);
}

// Initialize the dashboard
init();