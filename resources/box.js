//https://bl.ocks.org/mbostock/4061502 used as a base
//ISSUE: Boxes calculated before outliers (so outliers contained)
//therefore some of the whiskers are incorrect

(function() {

d3.box = function() {
  var width = 1,
      height = 1,
      duration = 0,
      domain = null,
      value = Number,
      whiskers = boxWhiskers,
      quartiles = boxQuartiles,
      showLabels = true,
      tickFormat = null,

      //THESE ARE TEMPORARY FOR RESTING
      minBPM = 60;
      maxBPM = 100;

  // For each small multiple…
  function box(g) {
    //console.log(g);
    g.each(function(d, i) {
      var date = d[0];

      d.splice(0, 1);
      d['date'] = date;

      d = d.map(value).sort(d3.ascending);

      var g = d3.select(this),
          n = d.length,
          min = d[0],
          max = d[n - 1];

      // Compute quartiles. Must return exactly 3 elements.
      var quartileData = d.quartiles = quartiles(d);

      //Getting the index of the minimum and maximum values from the data for the box plots (whisker ends)
      var whiskerIndices = whiskers.call(this, d, i);

      //Mapping the indexes of the minimum and maximum to the data
      var whiskerData = whiskerIndices.map(function(i) { return d[i]; });

      //All data outside of the whiskers are outliers
      var outlierIndices = d3.range(0, whiskerIndices[0]).concat(d3.range(whiskerIndices[1] + 1, n));

      //y-axis scale
      var y0 = d3.scale.linear()
          .domain([0, 200])
          .range([height + margin.top, 0]);

      //x-axis scale
      var x0 =d3.scale.linear()
          .domain([0, Infinity])
          .range(y0.range());

      //Creating the center line for the box plots
      var center = g.selectAll("line.center")
          .data([whiskerData]);

      center.enter().insert("line", "rect")
          .attr("class", "center")
          .attr("x1", width / 2)
          .attr("x2", width / 2)
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .style("opacity", 1)
          .attr("y1", function(d) { return y0(d[0]); })
          .attr("y2", function(d) { return y0(d[1]); });

      //Creating the box for the box plot
      var box = g.selectAll("rect.box")
          .data([quartileData]);

      box.enter().append("rect")
          .attr("class", "box")
          .attr("x", 0)
          .attr("y", function(d) { return x0(d[2]); })
          .attr("width", width)
          .attr("height", function(d) { return x0(d[0]) - x0(d[2]); })
        .transition()
          .duration(duration)
          .attr("y", function(d) { return y0(d[2]); })
          .attr("height", function(d) { return y0(d[0]) - y0(d[2]); });

      //Creating the median line for the box plots
      var medianLine = g.selectAll("line.median")
          .data([quartileData[1]]);

      medianLine.enter().append("line")
          .attr("class", "median")
          .attr("x1", 0)
          .attr("x2", width)
        .transition()
          .duration(duration)
          .attr("y1", y0)
          .attr("y2", y0);

      //Creating the whiskers for the box plots
      var whisker = g.selectAll("line.whisker")
          .data(whiskerData);

      whisker.enter().insert("line", "circle, text")
          .attr("class", "whisker")
          .attr("x1", 0)
          .attr("y1", x0)
          .attr("x2", 0 + width)
          .attr("y2", x0)
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .attr("y1", y0)
          .attr("y2", y0)
          .style("opacity", 1);

      //Adding the outlier dots to the box plots
      var outlier = g.selectAll("circle.outlier")
          .data(outlierIndices, Number);

      outlier.enter().insert("circle", "text")
          .attr("class", "outlier")
          .attr("r", 3)
          .attr("cx", width / 2)
          .attr("cy", function(i) { return x0(d[i]); })
          .style("opacity", 1e-10)
        .transition()
          .duration(duration)
          .attr("cy", function(i) { return y0(d[i]); })
          .style("opacity", 1);
      outlier.transition()
          .duration(duration)
          .attr("cy", function(i) { return y0(d[i]); })
          .style("opacity", 1);

      var format = y0.tickFormat(8);

      //Adding values next to the box plot (interquartiles and the median)
      var boxTick = g.selectAll("text.box")
          .data(quartileData);

      if (showLabels == true){
        boxTick.enter().append("text")
            .attr("class", "box")
            .attr("dy", ".3em")
            .attr("dx", function(d, i) { return i & 1 ? 6 : -6 })
            .attr("x", function(d, i) { return i & 1 ? width : 0 })
            .attr("y", x0)
            .attr("text-anchor", function(d, i) { return i & 1 ? "start" : "end"; })
            .text(format)
          .transition()
            .duration(duration)
            .attr("y", y0);
      }

      //Adding values next to the end of the whiskers
      var whiskerTick = g.selectAll("text.whisker")
          .data(whiskerData || []);

      if (showLabels == true){
        whiskerTick.enter().append("text")
            .attr("class", "whisker")
            .attr("dy", ".3em")
            .attr("dx", 6)
            .attr("x", width)
            .attr("y", x0)
            .text(format)
            .style("opacity", 1e-6)
          .transition()
            .duration(duration)
            .attr("y", y0)
            .style("opacity", 1);
      }
    })
    d3.timer.flush();
  }

  //SETTERS
  box.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return box;
  };

  box.height = function(x) {
    if (!arguments.length) return height;
    height = x;
    return box;
  };

  box.tickFormat = function(x) {
    if (!arguments.length) return tickFormat;
    tickFormat = x;
    return box;
  };

  box.duration = function(x) {
    if (!arguments.length) return duration;
    duration = x;
    return box;
  };

  box.domain = function(x) {
    if (!arguments.length) return domain;
    domain = x == null ? x : d3.functor(x);
    return box;
  };

  box.value = function(x) {
    if (!arguments.length) return value;
    value = x;
    return box;
  };

  box.whiskers = function(x) {
    if (!arguments.length) return whiskers;
    whiskers = x;
    return box;
  };

  box.quartiles = function(x) {
    if (!arguments.length) return quartiles;
    quartiles = x;
    return box;
  };

  box.minBPM = function(x) {
    if (!arguments.lengt) return min;
    min = x;
    return box;
  }

  box.maxBPM = function(x) {
    if (!arguments.lengt) return max;
    max = x;
    return box;
  }

  return box;
};

function boxWhiskers(d) {
  return [0, d.length - 1];
}

function boxQuartiles(d) {
  return [
    d3.quantile(d, .25),
    d3.quantile(d, .5),
    d3.quantile(d, .75)
  ];
}

})();
