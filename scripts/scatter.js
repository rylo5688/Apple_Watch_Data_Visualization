(function() {

d3.scatter = function() {
  var width = 1,
      height = 1,
      duration = 250,
      domain = null,
      value = Number,
      showLabels = false,
      minBPM = 50,
      maxBPM = null;
      fullDataSet = null;
      index = 0;

  function scatter(g) {
    g.each(function(d, i) {
        var time = d['time'];



        //y scale
        var y0 = d3.scale.linear()
            .domain([0, 200])
            .range([height + margin.top, 0]);

        // Retrieve the old x-scale, if this is an update.
        var x0 = d3.scale.linear()
            .domain([0, Infinity])
            .range(y0.range());

        var dot = g.selectAll("circle.scatter")
            .data([d]);

        dot.enter().insert("circle", "text")
            .attr("class", "scatter-dot")
            .attr("r", 3.5)
            .attr("cx", width/2)
            .attr("cy", y0(d))
            .attr("z", 2)
            .style("fill", function (i){ return heatmapColor(fullDataSet, index, minBPM, maxBPM); })
            .style("stroke", function (i){ return heatmapColor(fullDataSet, index, minBPM, maxBPM); })
            .style("opacity", 0)
          .transition()
            .duration(duration)
            .attr("r", 1.5)
            .style("opacity", 1);

        dot.append("svg:title")
          .text(d);

        //NEED to implement better mouseover
        // var format = d;
        // dot.on("mouseover", function(){
        //   console.log(y0(d));
        //   dot.append("svg:title")
        //     .text(d);
        // });

        index++;
    })
  }

    scatter.duration = function(x){
      if (!arguments.length){
        return duration;
      }
      duration = x;
      return scatter;
    };

    scatter.minBPM = function(x) {
      if (!arguments.length) return minBPM;
      minBPM = x;
      return scatter;
    }

    scatter.maxBPM = function(x) {
      if (!arguments.length) return maxBPM;
      maxBPM = x;
      return scatter;
    }

    scatter.fullDataSet = function(x){
      if (!arguments.length) return fullDataSet;
      index = 0;
      fullDataSet = x;
      return scatter;
    }

    scatter.width = function(x){
      if (!arguments.length){
        return width;
      }
      width = x;
      return scatter;
    };

    scatter.height = function(x){
      if (!arguments.length){
        return width;
      }
      height = x;
      return scatter;
    };

    scatter.domain = function(x){
      if (!arguments.length){
        return domain;
      }

      if (domain == null){
        domain = x;
      }
      else {
        domain = d3.functor(x);
      }
      return scatter;
    };
    return scatter;
  };
})();
