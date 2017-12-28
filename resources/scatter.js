(function() {

d3.scatter = function() {
  var width = 1,
      height = 1,
      duration = 0,
      domain = null,
      value = Number,
      showLabels = false,
      min = 0,
      max = 0;

  function scatter(g) {
      g.each(function(d, i) {
          var time = d[0];

          d.splice(0, 1);
          //d = d.map(value).sort(d3.ascending);
          //console.log(time);
          //Compute the new x-scale.
          var y0 = d3.scale.linear()
              .domain([0, 200])
              .range([height + margin.top, 0]);

          // Retrieve the old x-scale, if this is an update.
          var x0 = d3.scale.linear()
              .domain([0, Infinity])
              .range(y0.range());

          var dot = g.selectAll("circle.scatter")
              .data(d);

          dot.enter().insert("circle", "text")
              .attr("class", "scatter-dot")
              .attr("r", 1.5)
              .attr("cx", width/2)
              .attr("cy", x0(d))
              .style("opacity", 1e-10)
            .transition()
              .duration(duration)
              .attr("cy", y0(d))
              .style("opacity", 1);
      })
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
