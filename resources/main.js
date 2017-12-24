//Goal for next time: For all domains other than time we want to be able to scroll throughout the whole scope of the data

//GLOBALS
var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
'September', 'October', 'November', 'December'];
var DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var TIME = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am',
'12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm']

var previousData;
var previousType;
var margin = {top: 30, right: 30, bottom: 70, left: 30},
width = window.innerWidth*.95 - margin.left - margin.right,
height = window.innerHeight * 0.7;

var min = Infinity,
max = -Infinity;

var domainType = 0; //0 = year, 1 = month, 2 = day, 3 = time
var domainTitle = ['Year', 'Month', 'Day', 'Time'];

var maxBPM = 100;
var minBPM = 60;

var chart = d3.box()
  .whiskers(iqr(1.5))
  .width(width)
  .height(height)
  .domain([min,max]);

var chartScatter = d3.scatter()
  .width(width)
  .height(height)
  .domain([min, max]);

var index = 0;

//returns an array of ['year', 'month', 'day']
function ParseDate(date){
  var mmddyy = new Array();
  var i = 1;
  var index = date.indexOf('/');
  while (index != -1){
    mmddyy[i] = date.substring(0, index);
    date = date.substring(index+1, date.length);

    index = date.indexOf('/');
    i = (i + 1) % 3; //to order the date in yy/mm/dd
  }
  mmddyy[i] = date;

  return mmddyy;
}

function CreateDomain(data){
  var arr = [];
  switch (domainType){
    case 0: //need to make this case
      var yearStart = parseInt(data[0][0]);
      var yearEnd = parseInt(data[data.length-1][0]);

      for (var i = yearStart; i <= yearEnd; i++){
        arr.push(i.toString());
      }

      return d3.scale.ordinal()
        .domain(arr)
        .rangeBands([0 , width], .93);

    case 1: //month
      var date = ParseDate(data[0][0]);
      console.log(date);
      for (var i = 1; i <= 12; i++){
        arr.push(i.toString() + "/" + date[2]); //NOTE: Need to fix ParseDate to accept other date formats
      }

      return d3.scale.ordinal()
        .domain(arr)
        .rangeBands([0 , width], .93);

    case 2: //DAYS
      var date = ParseDate(data[0][0]);
      var totalDAYS = DAYS[date[1]-1]

      for (var i = 1; i <= totalDAYS; i++){
        arr.push(date[1] + "/" + i.toString() + "/" + date[0]);
      }

      return d3.scale.ordinal()
        .domain(arr)
        .rangeBands([0 , width], .93);

    case 3: //time
      return d3.scale.ordinal()
                .domain(TIME)
                .rangeBands([0 , width], .4);
  };
}

function UpdateBPMRange(type){
  d3.selectAll(".maxBPMLine").remove(); //delete current box plots
  d3.selectAll(".minBPMLine").remove(); //delete current box plots
  if (type == null){
    type = previousType;
  }

  // the y-axis
  var y = d3.scale.linear()
    .domain([0, 200])
    .range([height + margin.top, 0]);


  //adding lines for the max and min BPM
  var maxBPMLine = type == 'b' ? d3.select(".box") : d3.select(".scatter");
  if (document.getElementById("restingFilter").checked == true){
      maxBPMLine.append("line")
      .attr("class", "maxBPMLine")
      .style("stroke", "red")
      .attr("x1", margin.left)
      .attr("y1", y(maxBPM) + margin.top)
      .attr("x2", width + margin.right)
      .attr("y2", y(maxBPM) + margin.top);
  }
  else {
    maxBPMLine.append("line")
    .attr("class", "maxBPMLine")
    .style("stroke", "red")
    .attr("x1", margin.left)
    .attr("y1", y(150) + margin.top)
    .attr("x2", width + margin.right)
    .attr("y2", y(150) + margin.top);
  }

  var minBPMLine = type == 'b' ? d3.select(".box") : d3.select(".scatter");
    minBPMLine.append("line")
    .attr("class", "minBPMLine")
    .style("stroke", "blue")
    .attr("x1", margin.left)
    .attr("y1", y(minBPM) + margin.top)
    .attr("x2", width + margin.right)
    .attr("y2", y(minBPM) + margin.top);
}

function CreatePlot(data, type){
  //rescaling
  var extendScreen = data.length >= 12 ? (data.length) * 80 : 0;
  d3.select(".data").style("width", window.innerWidth + extendScreen + "px");
  d3.select(".box").style("width", window.innerWidth + extendScreen + "px");
  width = window.innerWidth*.95 - margin.left - margin.right + extendScreen; //to compensate for screen size changes

  if (type == 'b'){ //box plot
    //create box plots based off of the max bpms
    chart.maxBPM(maxBPM);
    chart.minBPM(minBPM);

    var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class", "box")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }
  else if (type == 's'){ //scatter plot
    var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class", "scatter")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }

  // the x-axis
  var x = CreateDomain(data);

  //console.log(width)
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  // the y-axis
  var y = d3.scale.linear()
    .domain([0, 200])
    .range([height + margin.top, 0]);

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  if (type == 'b'){ //draw the box plots
    svg.selectAll(".box")
        .data(data)
      .enter().append("g")
      .attr("transform", function(d) { return "translate(" +  x(d[0])  + "," + 0 + ")"; } )
        .call(chart.width(x.rangeBand()))
      .on("click", Update);
  }
  else if (type == 's'){ //draw the scatter plots
    //readjusting the x-axis
    x = CreateDomain(data);
    //console.log(width)
    xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var tickWidth = x("12am");
    var meridiem = "am"; //for 12 hr clock cycle
    var lastTime = "";
    var arr;
    var timeString;
    var hour;
    var minute;
    var second;
    var offset;

    data.forEach(function(element){
      arr = [element];
      timeString = arr[0][0];
      hour = timeString.substring(0, timeString.indexOf(':'));

      if (parseInt(lastTime) > parseInt(hour)){ //passed the 12 hour mark
        meridiem = "pm";
      }

      lastTime = hour;

      if (hour == "0"){
        hour = "12"
      }
      hour = hour + meridiem; //so that the time becomes 12am, etc.

      timeString = timeString.substring(timeString.indexOf(':') + 1, timeString.length);
      minute = timeString.substring(0, timeString.indexOf(':')); //to use for getting the offset
      second = timeString.substring(timeString.indexOf(":") + 1, timeString.length);

      //calculating the distance between ticks
      offset = x(hour) + parseFloat(minute)/60.0*tickWidth + parseFloat(second)/360.0*tickWidth;

      //creating scatter plot "dots"
      svg.selectAll(".scatter")
          .data(arr)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" +  offset  + "," + 0 + ")"; } )
          .call(chartScatter.width(x.rangeBand()))
        .on("click", Update);
    });
  }

  UpdateBPMRange(type);

  //draw y axis
  svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
    .append("text") // and text1
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font-size", "16px")
      .text("Heart Rate");

  // draw x axis
  svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + (height  + margin.top) + ")")
      .call(xAxis)
    .append("text")             // text label for the x axis
        .attr("x", (width / 2) )
        .attr("y",  25 )
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .text(domainTitle[domainType]);

    previousData = data;
    previousType = type;
}

function GoToHome(){
  d3.selectAll("svg").remove(); //delete current box plots

  d3.csv("data/hassan-HR-data.csv", function(error, csv) {
    if (error) throw error;

    var d = [];
    var dateArr;
    var year;
    var month;
    var day;
    var index = 0;
    csv.forEach(function(x) {
      var date = x.Date,
      time = x.time,
      heartRate = Math.floor(x.heart_rate);

      dateArr = ParseDate(date);
      year = '20' + dateArr[0].toString();
      month = dateArr[1].toString();
      day = dateArr[2].toString();

      if (d[index] == null){
        d[index] = [year];
      }

      if (d[index][0] != year){
        index++;
        d[index] = [year];
      }

      d[index].push(heartRate);

      //Changing mins and maxes when needed
      if (heartRate > max){
        max = heartRate;
      }
      if (heartRate < min){
        min = heartRate;
      }
    });

    chart.domain([min, max]);

    domainType = 0; //0 = year, 1 = month, 2 = day, 3 = time
    CreatePlot(d, 'b');
  });
}

function Update(d){
  d3.csv("data/hassan-HR-data.csv", function(error, csv) {
    if (error) throw error;

    var data = [];
    var dateArr;
    var year;
    var month;
    var day;
    var index = 0;
    var filterIndex;

    if (d['date'].match(/\//g || []) == null){ //year
      domainType = 0; //0 = year, 1 = month, 2 = day, 3 = time
      filterIndex = 0;
    }
    else if (d['date'].match(/\//g || []).length == 1){ //month, year
      domainType = 1; //0 = year, 1 = month, 2 = day, 3 = time
      filterIndex = 1;
    }
    else if (d['date'].match(/\//g || []).length == 2){ //month, day, year
      domainType = 2; //0 = year, 1 = month, 2 = day, 3 = time
      filterIndex = 2;
    }

    d3.selectAll("svg").remove(); //delete current box plots

    var dateInput;
    var inRange = false;
    csv.forEach(function(x) {
      var date = x.Date,
      time = x.time,
      heartRate = Math.floor(x.heart_rate);

      dateArr = ParseDate(date);
      year = '20' + dateArr[0].toString();
      month = dateArr[1].toString();
      day = dateArr[2].toString();

      var format;
      if (filterIndex == 0){
        domainType = 1; //0 = year, 1 = month, 2 = day, 3 = time
        format = year;
        dateInput = month + '/' + year;
      }
      else if (filterIndex == 1){
        domainType = 2; //0 = year, 1 = month, 2 = day, 3 = time
        format = month + '/' + year;
        dateInput = month + '/' + day + '/' + year;
      }
      else {
        domainType = 3; //0 = year, 1 = month, 2 = day, 3 = time
        format = month + '/' + day + '/' + year;
        dateInput = time;
      }

      inRange = (format == d['date']);

      if (inRange && data[index] == null){
        data[index] = [];
        data[index] = [dateInput];

      }

      if (inRange && data[index][0] != dateInput){
        index++;
        data[index] = [dateInput];
      }

      if (inRange){
        data[index].push(heartRate);
      }

      //Changing mins and maxes when needed
      if (heartRate > max){
        max = heartRate;
      }
      if (heartRate < min){
        min = heartRate;
      }
    });
    chart.domain([min, max]);
    chartScatter.domain([min,max]);

    //width =  window.innerWidth/data.length;
    if (filterIndex == 2){
      CreatePlot(data, 's');
    }
    else {
      CreatePlot(data, 'b');
    }
  });
}

function GoBack(){
  d = previousData;

  if (d == null){
    return;
  }
  d3.csv("data/hassan-HR-data.csv", function(error, csv) {
    if (error) throw error;

    var data = [];
    var dateArr;
    var year;
    var month;
    var day;
    var index = 0;
    var filterIndex;

    if (d['date'].match(/\//g || []) == null){ //year
      domainType = 0; //0 = year, 1 = month, 2 = day, 3 = time
      filterIndex = 0;
      d['date'] = "";
    }
    else if (d['date'].match(/\//g || []).length == 1){ //month, year
      domainType = 1; //0 = year, 1 = month, 2 = day, 3 = time
      filterIndex = 1;
      d['date'] = d['date'].substring(d['date'].length-4, d['date'].length); //year
    }
    else { //day, month, year
      domainType = 2; //0 = year, 1 = month, 2 = day, 3 = time
      d['date'] = d['date'].substring(0, d['date'].indexOf('/') + 1) + d['date'].substring(d['date'].length-4, d['date'].length); //month, year
    }

    d3.selectAll("svg").remove(); //delete current box plots

    var dateInput;
    var inRange = false;
    csv.forEach(function(x) {
      var date = x.Date,
      time = x.time,
      heartRate = Math.floor(x.heart_rate);

      dateArr = ParseDate(date);
      year = '20' + dateArr[0].toString();
      month = dateArr[1].toString();
      day = dateArr[2].toString();

      var format;
      if (filterIndex == 0){
        format = "";
        dateInput = year;
      }
      else if (filterIndex == 1){
        format = year;
        dateInput = month + '/' + year;
      }
      else {
        format = month + '/' + year;
        dateInput = month + '/' + day + '/' + year;
      }

      inRange = (format == d['date']);

      if (inRange && data[index] == null){
        data[index] = [];
        data[index] = [dateInput];

      }

      if (inRange && data[index][0] != dateInput){
        index++;
        data[index] = [dateInput];
      }

      if (inRange){
        data[index].push(heartRate);
      }

      //Changing mins and maxes when needed
      if (heartRate > max){
        max = heartRate;
      }
      if (heartRate < min){
        min = heartRate;
      }
    });

    CreatePlot(data, 'b');
  });
}

// Returns a function to compute the interquartile range.
function iqr(k) {
  return function(d, i) {
    var q1 = d.quartiles[0],
    q3 = d.quartiles[2],
    iqr = (q3 - q1) * k,
    i = -1,
    j = d.length;
    while (d[++i] < q1 - iqr);
    while (d[--j] > q3 + iqr);
    return [i, j];
  };
}
