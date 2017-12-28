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
      dataTime = null,

      //THESE ARE TEMPORARY FOR RESTING
      minBPM = null,
      maxBPM = null;

  // For each small multiple…
  function box(g) {
    g.each(function(d, i) {
      var date = d[0];

      d.splice(0, 1);

      d['date'] = date;

      var timeArray = null;

      for (var i = 0; i < dataTime.length; i++){
        if (dataTime[i][0] == date){
          timeArray = dataTime[i];
        }
      }

      if (timeArray == null){
        console.log("Data array does not match the time array");
        return;
      }
      else {
        timeArray.splice(0, 1);
      }

      //We need our own sort so we can put the data in ascending order while changing the matching indexes of the time array
      quicksort(d, timeArray, 0, d.length-1);

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

      outlierIndices = validOutliers(d, timeArray, outlierIndices, date);

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
          .attr("r", 1)
          .attr("cx", width / 2)
          .attr("cy", function(i) { return x0(d[i]); })
          .style("fill", function (i){ return heatmapColor(d, i, minBPM, maxBPM); })
          .style("stroke", function (i){ return heatmapColor(d, i, minBPM, maxBPM); })
        .transition()
          .duration(duration)
          .attr("cy", function(i) { return y0(d[i]); });

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

  box.dataTime = function(x) {
    if (!arguments.length) return dataTime;
    dataTime = x;
    return box;
  }

  box.minBPM = function(x) {
    if (!arguments.length) return minBPM;
    minBPM = x;
    return box;
  }

  box.maxBPM = function(x) {
    if (!arguments.length) return maxBPM;
    maxBPM = x;
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

function heatmapColor(d, index, minBPM, maxBPM){
  var concentration = 0;

  if (maxBPM == null || d[index] <= maxBPM){
    return "#000000";
  }

  //Checking indices before this index
  for (var i = index; i > 0 && d[i] > minBPM; i--){
    if (Math.abs(d[i] - d[i-1]) <= 2 && d[i] > maxBPM){
      concentration++;
    }
    else{
      break;
    }
  }

  //Checking indices after this index
  for (var i = index; i < d.length && d[i] < maxBPM; i++){
    if (Math.abs(d[i] - d[i+1]) <= 2 && d[i] > maxBPM){
      concentration++;
    }
    else{
      break;
    }
  }


  //Deciding color based on concentration
  switch(concentration){
    case 0:
      return "#000000";
    case 1:
      return "#0019FF";
    case 2:
      return "#007DFF";
    case 3:
      return "#00D2FF";
    case 4:
      return "#00FF3F";
    case 5:
      return "#9FFF00";
    case 6:
      return "#6BFF00";
    case 7:
      return "#FF8000";
    case 8:
    default:
      return "#FF0000";
  }
}

function partition(data, timeArray, low, high){
  var pivot = data[high];
  var i = low - 1;
  var temp;

  for (var j = low; j <= high-1; j++){
    if (data[j] <= pivot){
      i++;

      temp = data[i];
      data[i] = data[j];
      data[j] = temp;

      temp = timeArray[i];
      timeArray[i] = timeArray[j];
      timeArray[j] = temp;
    }
  }
  temp = data[i + 1];
  data[i + 1] = data[high];
  data[high] = temp;

  temp = timeArray[i + 1];
  timeArray[i + 1] = timeArray[high];
  timeArray[high] = temp;

  return i + 1;
}

function quicksort(data, timeArray, i, j){
  if (i < j){
    var partitionIndex = partition(data, timeArray, i, j);
    quicksort(data, timeArray, i, partitionIndex-1);
    quicksort(data, timeArray, partitionIndex+1, j)
  }
}

//Returns array: [hour, time]
function parseTime(time){
  var arr = [];
  var index = time.indexOf(':');
  arr.push(parseInt(time.substring(0, index)));
  time = time.substring(index+1, time.length);

  index = time.indexOf(':');
  arr.push(parseInt(time.substring(0, index)));

  return arr;
}

function validOutliers(data, timeArray, indices, date){
  var index1, index2, index3, min1, min2, min3;

  var valid = [];
  for (var i = 1; i < indices.length-1; i++){
    index1 = indices[i-1];
    index2 = indices[i];
    index3 = indices[i+1];

    time1 = parseTime(timeArray[index1]);
    time2 = parseTime(timeArray[index2]);
    time3 = parseTime(timeArray[index3]);

    //rule 1 - If the outliers included 3 readings they were less than 5 beats apart and measured within 2 minutes
    //Then they are considered valid
    if (Math.abs(data[index1] - data[index2]) <= 5 && Math.abs(data[index2] - data[index3]) <= 5 && Math.abs(data[index3] - data[index1]) <= 5){
      if (time1[0] == time2[0] && time2[0] == time3[0]){
        if (Math.abs(time1[1] - time2[1]) <= 2 && Math.abs(time2[1] - time3[1]) <= 2 && Math.abs(time3[1] - time1[1]) <=2){
          valid.push(index1);
          valid.push(index2);
          valid.push(index3);

          i+=2;
          continue;
        }
      }
    }

    //rule 2 - If there are 2 readings that are exactly the same or one beat apart, within 1 minute , then it’s considered a valid reading.
    if (time1[0] == time2[0]){
      if (Math.abs(data[index1] - data[index2]) <= 1 && Math.abs(min1 - min2) <= 1){
        valid.push(index1);
        valid.push(index2);

        i++;
        continue;
      }
    }

    //rule 3 - Any reading higher than 100, and that has more than 15 beats difference with the readings before and after it, within one minute, is considered false positive
    if (data[index2] >= 100){ //false positive
      if (Math.abs(data[index1] - data[index2]) >= 15 && Math.abs(data[index2] - data[index3]) >= 15){
        if (time1[0] == time2[0] && time2[0] == time3[0]){
          if (Math.abs(time1[1] - time2[1]) <= 1 && Math.abs(time2[1] - time3[1]) <= 1 && Math.abs(time3[1] - time1[1]) <=1 ){
            continue;
          }
        }
      }
    }
  }

  return valid;
}

})();
