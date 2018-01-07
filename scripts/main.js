//Goal for next time: For all domains other than time we want to be able to scroll throughout the whole scope of the data

//GLOBALS
var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
'September', 'October', 'November', 'December'];
var MONTHSHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
'Sep', 'Oct', 'Nov', 'Dec'];
var MONTHDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var TIME = ['1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am',
'12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm']

var maxBPM = 100;
var minBPM = 60;
var firstName = "Joe";
var lastName = "";
var age = 48; //48 39
var fitnessLevel = "Lightly Active";

var data = [];
var currentData;
var currentType;
var currentTitle;
var currentDate;

var margin = {top: 50, right: 50, bottom: 100, left: 50},
width = window.innerWidth*.95 - margin.left - margin.right,
height = window.innerHeight * 0.6;

var min = Infinity,
max = -Infinity;

var domainType = 0; //0 = year, 1 = month, 2 = week, 3 = day
var domainTitle = ['Month', 'Day', 'Day', 'Time'];

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
function parseDate(date){
  var mmddyy = new Array();
  var i = 1;
  var index = date.indexOf('/');
  while (index != -1){
    mmddyy[i] = parseInt(date.substring(0, index));
    date = date.substring(index+1, date.length);

    index = date.indexOf('/');
    i = (i + 1) % 3; //to order the date in yy/mm/dd
  }
  if (date.length != 4){ //date is not in thousands.. this is for data string issues
    mmddyy[i] = parseInt("20" + date);
  }
  else {
    mmddyy[i] = parseInt(date);
  }

  return mmddyy;
}

//returns an array of ['hour', 'minute', 'second']
function parseTime(time){
  var hhmmss = new Array();
  var i = 0;
  var index = time.indexOf(':');
  while (index != -1){
    hhmmss[i] = parseInt(time.substring(0, index));
    time = time.substring(index+1, time.length);

    index = time.indexOf(':');
    i++;
  }
  hhmmss[i] = parseInt(time);

  return hhmmss;
}

//returns Date object from a string
function getDate(date, time){
  var dateArr = ParseDate(date);
  var timeArr = ParseTime(time);

  //NOTE: The year has to be hard coded due to the data (fix this)
  return new Date(Date.UTC("20" + dateArr[0], dateArr[1]-1, dateArr[2], timeArr[0], timeArr[1], timeArr[2], 0));
}

function getWeekRange(date){
  var dateArr = parseDate(date);
  var dateObj = new Date(dateArr[0], dateArr[1]-1, dateArr[2]);
  var index = dateObj.getDay();

  var rangeArr = new Array(7); //0 = Sunday, ... , 6 = Saturday

  var dateStr;
  dateObj.setDate(dateObj.getDate()-index);

  for (var i = 0; i < index; i++){
    dateStr = (dateObj.getMonth()+1) + "/" + dateObj.getDate() + "/" + dateObj.getFullYear();
    rangeArr[i] = dateStr;

    dateObj.setDate(dateObj.getDate()+1);
  }

  rangeArr[index] = (dateObj.getMonth()+1) + "/" + dateObj.getDate() + "/" + dateObj.getFullYear();
  dateObj.setDate(dateObj.getDate()+1);

  for (var i = index+1; i < 7; i++){
    dateStr = (dateObj.getMonth()+1) + "/" + dateObj.getDate() + "/" + dateObj.getFullYear();
    rangeArr[i] = dateStr;

    dateObj.setDate(dateObj.getDate()+1);
  }

  return rangeArr;
}

function createDomain(data){
  var arr = [];
  switch (domainType){
    case 0: //need to make this case
    for (var i = 0; i < 12; i++){
      //arr.push(month + "/" + i + "/" + year); //NOTE: Need to fix ParseDate to accept other date formats
      arr.push(MONTHS[i]);
    }

    return d3.scale.ordinal()
      .domain(arr)
      .rangeBands([0 , width], .9);
    case 1: //Month
      var month = parseDate(currentDate);
      var isLeapYear = !(month[0]%4);
      var days = MONTHDAYS[month[1]-1];
      if (isLeapYear && month[1] == 2){
        days = 29;
      }

      for (var i = 1; i <= days; i++){
        //arr.push(month + "/" + i + "/" + year); //NOTE: Need to fix ParseDate to accept other date formats
        arr.push(i)
      }

      return d3.scale.ordinal()
        .domain(arr)
        .rangeBands([0 , width], .8);
    case 2: //Week
      var range = getWeekRange(currentDate);

      //Setting each day with a date number Ex. Sunday 1
      for (var i = 0; i < 7; i++){
        arr.push(DAYS[i]);
        //arr.push(range[i]);
      }

      return d3.scale.ordinal()
        .domain(arr)
        .rangeBands([0 , width], .93);
    case 3: //Day
      return d3.scale.ordinal()
                .domain(TIME)
                .rangeBands([0 , width], .4);
  };
}

function updateBPMRange(dataSubset, type, title){
  d3.selectAll(".minBPMLine").remove();
  d3.selectAll(".maxBPMLine").remove();
  d3.selectAll(".moderateActivityRange").remove()

  if (type == null){
    type = currentType;
  }

  if (type == "s"){
      d3.selectAll("svg").remove(); //delete current plots
      if (dataSubset == null){
        createPlot(currentData, currentType, currentTitle);
      }
      else {
        createPlot(dataSubset, type, title);
      }
  }

  if (d3.select("#noneFilter").property("checked") == true){ //no filter
    return;
  }

  // the y-axis
  var y = d3.scale.linear()
    .domain([0, 200])
    .range([height + margin.top, 0]);


  //adding lines for the max and min BPM
  var maxBPMLine = type == 'b' ? d3.select(".box").select("g") : d3.select(".scatter").select("g");
  if (d3.select("#restingFilter").property("checked") == true){ //resting max
      maxBPMLine.append("line")
        .attr("class", "maxBPMLine")
        .style("stroke", "red")
        .attr("x1", 0)
        .attr("y1", y(maxBPM))
        .attr("x2", width)
        .attr("y2", y(maxBPM))
      .append("svg:title")
        .text("Maximum healthy HR");

      var minBPMLine = type == 'b' ? d3.select(".box").select("g") : d3.select(".scatter").select("g");
        minBPMLine.append("line")
          .attr("class", "minBPMLine")
          .style("stroke", "blue")
          .attr("x1", 0)
          .attr("y1", y(minBPM))
          .attr("x2", width)
          .attr("y2", y(minBPM))
        .append("svg:title")
          .text("Minimum healthy HR range");
  }
  else if (d3.select("#activeFilter").property("checked") == true){ //active max
    var maxActiveBPM = 208-.7*age;
    maxBPMLine.append("line")
      .attr("class", "maxBPMLine")
      .style("stroke", "red")
      .attr("x1", 0)
      .attr("y1", y(maxActiveBPM))
      .attr("x2", width)
      .attr("y2", y(maxActiveBPM))
    .append("svg:title")
      .text("Maximum healthy HR");

    var moderateActivityRange = maxBPMLine;
    moderateActivityRange.append("rect")
      .attr("class", "moderateActivityRange")
      .style("stroke", "red")
      .style("fill", "red")
      .style("opacity", .3)
      .attr("x", 0)
      .attr("y", y(.69*maxActiveBPM))
      .attr("width", width)
      .attr("height", y(.5*maxActiveBPM) - y(.69*maxActiveBPM))
    .append("svg:title")
      .text("Moderate activity HR range");

    var minBPMLine = type == 'b' ? d3.select(".box").select("g") : d3.select(".scatter").select("g");
      minBPMLine.append("line")
        .attr("class", "minBPMLine")
        .style("stroke", "blue")
        .attr("x1", 0)
        .attr("y1", y(minBPM))
        .attr("x2", width)
        .attr("y2", y(minBPM))
      .append("svg:title")
        .text("Minimum healthy HR range");
  }
}

function createPlot(dataSubset, type, title){
  //setting maxBPM and minBPM
  if (d3.select("#restingFilter").property("checked") == true){ //resting max
      chart.maxBPM(100);
      chartScatter.maxBPM(100);
  }
  else if (d3.select("#activeFilter").property("checked") == true) { //active max
      var maxActiveBPM = 208-.7*age;
      chart.maxBPM(maxActiveBPM);
      chartScatter.maxBPM(maxActiveBPM);
  }
  else {
    chart.maxBPM(Infinity);
    chartScatter.maxBPM(Infinity);
  }

  if (dataSubset == currentData){ //updating current plot
    chart.duration(0);
    chartScatter.duration(0);
  }
  else{
    chart.duration(300);
    chartScatter.duration(300);
  }

  currentData = dataSubset;
  currentType = type;
  currentTitle = title;

  d3.select(".data").style("width", window.innerWidth);
  d3.select(".box").style("width", window.innerWidth);
  width = window.innerWidth*.95 - margin.left - margin.right; //to compensate for screen size changes

  if (type == 'b'){ //box plot
    //create box plots based off of the max bpms
    var svg = d3.select(".data").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class", "box")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }
  else if (type == 's'){ //scatter plot
    var svg = d3.select(".data").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class", "scatter")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }

  // the x-axis
  var x = createDomain(dataSubset);

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

  //draw title
  svg.append("text")
    .attr("x", (width/2))
    .attr("y", -22)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text(title);

  //draw user information
  svg.append("text")
    .attr("x", (width/2))
    .attr("y", -5)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Name: " + firstName + ", Age: " + age);

  //left arrow
  svg.append("text")
    .attr("class", "arrows")
    .attr("x", (width/4)*1)
    .attr("y", -15)
    .text("<")
    .on("click", function(){
      var dateArr = parseDate(currentDate);
      var dateStr;
      switch (domainType){
        case 0:
          dateStr = dateArr[1] + "/" + dateArr[2] + "/" + (dateArr[0]-1);
          setScope("y", dateStr);
          break;
        case 1: //NOTE: we default to the first of the month
          if (dateArr[1]-1 == 0){ //going back a month from January
            dateStr = "12/1" + "/" + (dateArr[0]-1);
          }
          else {
            dateStr = (dateArr[1]-1) + "/1/" + dateArr[0];
          }
          setScope("m", dateStr);
          break;
        case 2:
          if (dateArr[2]-7 <= 0){ //going back a month
            var offset = 7-dateArr[2];
            if (dateArr[1]-1 == 0){ //going back a month from January
              dateStr = "12/" + (MONTHDAYS[11]-offset) + "/" + (dateArr[0]-1);
            }
            else {
              dateStr = (dateArr[1]-1) + "/" + (MONTHDAYS[dateArr[1]-1]-offset) + "/" + dateArr[0];
            }
          }
          else {
            dateStr = dateArr[1] + "/" + (dateArr[2]-7) + "/" + dateArr[0];
          }
          setScope("w", dateStr);
          break;
        case 3:
          if (dateArr[2]-1 == 0){ //going back a month
            if (dateArr[1]-1 == 0){ //going back a month from January
              dateStr = "12/31/" + (dateArr[0]-1);
            }
            else {
              dateStr = (dateArr[1]-1) + "/" + (MONTHDAYS[dateArr[1]-2]) + "/" + dateArr[0];
              console.log(dateStr);
            }
          }
          else {
            dateStr = dateArr[1] + "/" + (dateArr[2]-1) + "/" + dateArr[0];
          }
          setScope("d", dateStr);
          break;
      }
    });

  //right arrow
  svg.append("text")
    .attr("class", "arrows")
    .attr("x", (width/4)*3)
    .attr("y", -15)
    .text(">")
    .on("click", function(){
      var dateArr = parseDate(currentDate);
      var dateStr;
      switch (domainType){
        case 0:
          dateStr = dateArr[1] + "/" + dateArr[2] + "/" + (dateArr[0]+1);
          setScope("y", dateStr);
          break;
        case 1: //NOTE: we default to the first of the month
          if (dateArr[1]+1 == 13){ //going forward  a month from December
            dateStr = "1/1" + "/" + (dateArr[0]+1);
          }
          else {
            dateStr = (dateArr[1]+1) + "/1/" + dateArr[0];
          }
          setScope("m", dateStr);
          break;
        case 2:
          if (dateArr[2]+7 > MONTHDAYS[dateArr[1]-1]){ //going forward a month
            var offset = 7-(MONTHDAYS[dateArr[1]-1] - dateArr[2]);
            if (dateArr[1]+1 == 13){ //going back a forward from December
              dateStr = "1/" + offset + "/" + (dateArr[0]-1);
            }
            else {
              dateStr = (dateArr[1]+1) + "/" + offset + "/" + dateArr[0];
            }
          }
          else {
            dateStr = dateArr[1] + "/" + (dateArr[2]+7) + "/" + dateArr[0];
          }
          setScope("w", dateStr);
          break;
        case 3:
          if (dateArr[2]+1 > MONTHDAYS[dateArr[1]-1]){ //going forward a month
            if (dateArr[1]+1 == 13){ //going forward a month from December
              dateStr = "1/1/" + (dateArr[0]+1);
            }
            else {
              dateStr = (dateArr[1]+1) + "/1/" + dateArr[0];
            }
          }
          else {
            dateStr = dateArr[1] + "/" + (dateArr[2]+1) + "/" + dateArr[0];
          }
          setScope("d", dateStr);
          break;
      }
    });

  //draw left y axis
  svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
    .append("text") // and text1
      .attr("transform", "translate( -49 ," + height/16*9 + ")rotate(-90)")
      .attr("dy", ".71em")
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .text("HR (bpm)");

  //draw right y axis
  yAxis.orient("right");
  svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + width + ")")
        .call(yAxis)
      .append("text") // and text1
        .attr("transform", "translate( 49 ," + height/16*9 + ")rotate(90)")
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .text("HR (bpm)");

  //right unit label
  // svg.append("text")
  //     .attr("class", "unitLabel")
  //     .attr("transform", "translate(" + (width + 43) + "," + 10 + ")rotate(90)")
  //     .attr("dy", ".71em")
  //     .style("text-anchor", "middle")
  //     .style("font-size", "12px")
  //     .text("bpm");

  //draw x axis
  svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + (height  + margin.top) + ")")
      .call(xAxis)
    .append("text")             // text label for the x axis
      .attr("x", (width / 2) )
      .attr("y",  30 )
      .attr("dy", ".71em")
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .text(domainTitle[domainType]);

  //Creating the plots
  if (type == 'b'){ //box plots
    svg.selectAll(".box")
        .data(dataSubset)
      .enter().append("g")
      .attr("transform", function(d) { return "translate(" +  x(d['xaxis'])  + "," + 0 + ")"; } )
        .call(chart.width(x.rangeBand()))
      .on("click", function(d){
        setScope("parse", d);
      });
    updateBPMRange(data, type, title);
  }
  else if (type == 's'){ //scatter plot
    //readjusting the x-axis
    var dataSubsetUnsorted = dataSubset.slice();
    quicksort(dataSubset, 0, dataSubset.length - 1);
    var sorted = dataSubset;

    //calculating the outliers and removing and invalid ones
    var d = dataSubset.map(Number).sort(d3.ascending);
    var n = d.length;

    d['quartiles'] = quartiles(d);

    var whiskerIndices = iqr(1.5)(d, 0);

    var outlierIndices = getOutliers(dataSubsetUnsorted, d[whiskerIndices[0]], d[whiskerIndices[1]]);

    var fullOutlierIndices = outlierIndices.slice();
    outlierIndices = validOutliers(dataSubsetUnsorted, outlierIndices);

    removeInvalidOutlier(sorted, fullOutlierIndices, outlierIndices);

    //plotting all points and valid outliers
    x = createDomain(dataSubset);

    xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    chartScatter.fullDataSet(dataSubset);
    var tickWidth = x("1am");
    var lastTime = "";
    var arr;
    var time;
    var hour;
    var minute;
    var second;
    var offset;

    dataSubset.forEach(function(element){
      arr = element;
      time = arr['time'];
      minute = time[1];
      second = time[2];

      if (time[0] < 12){
        if (time[0] == 0){
          hour = "12am";
        }
        else {
          hour = time[0] + "am";
        }
      }
      else {
        if (time[0] == 12){
          hour = "12pm";
        }
        else {
          hour = (time[0]-12)+"pm";
        }
      }

      //calculating the distance between ticks
      if (hour == "12am"){
        offset = parseFloat(minute)/60.0*tickWidth + parseFloat(second)/60.0*tickWidth;
      }
      else {
        offset = x(hour) + parseFloat(minute)/60.0*tickWidth + parseFloat(second)/60.0*tickWidth;
      }

      //creating scatter plot "dots"
      svg.selectAll(".scatter")
          .data(arr)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" +  offset  + "," + 0 + ")"; } )
          .call(chartScatter.width(x.rangeBand()));
    });
  }

  //top horizontal grid line
  svg.append("line")
      .attr("class", "grid")
      .style("stroke", "black")
      .style("opacity", 1)
      .attr("x1", 0)
      .attr("y1", y(200))
      .attr("x2", width)
      .attr("y2", y(200))

  //horizontal grid lines
  for (i = 180; i > 0; i-=20){
    svg.append("line")
      .attr("class", "grid")
      .style("stroke", "black")
      .style("opacity", .05)
      .attr("x1", 0)
      .attr("y1", y(i))
      .attr("x2", width)
      .attr("y2", y(i));
  }
}

function setScope(scope, date){
  d3.selectAll("svg").remove(); //delete current plots
  d3.selectAll("a").style("background", "none");

  if (date == null){
    date = data[data.length-1]['dateStr'];
  }

  if (scope == "parse"){
    switch (domainType){
      case 0:
        scope = "m";
        date = date[0]['dateStr'];
        break;
      case 1:
        scope = "w";
        date = date[0]['dateStr'];
        break;
      case 2:
        scope = "d";
        date = date[0]['dateStr'];
    }

  }

  currentDate = date;
  var dataSubset = [];
  if (scope == 'd'){
    //highlighting the day block
    var block = d3.select("#dayBlock");
    block.style("background", "#FEECEB");

    //getting the subset of data
    for (var i = data.length-1; i >= 0; i--){
      if (date == data[i]['dateStr']){
        dataSubset.push(data[i]);
      }

      if (date != data[i]['dateStr'] && dataSubset.length > 0){
        break;
      }
    }

    var dateArr = parseDate(currentDate);
    var dateObj = new Date(dateArr[0], dateArr[1]-1, dateArr[2]);
    var title = DAYS[dateObj.getDay()] + " " + MONTHSHORT[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear();

    dataSubset.reverse(); //since we started pushing from newer dates to older dates
    domainType = 3;
    updateBPMRange(dataSubset, 's', title);
  }
  else if (scope == 'w'){
    //highlighting the week block
    var block = d3.select("#weekBlock");
    block.style("background", "#FEECEB");

    var range = getWeekRange(date);

    //getting the subset of data
    var minimumDate = parseDate(range[0]);
    for (var i = data.length-1; i >= 0; i--){
      for (var rangeIndex = 0; rangeIndex < range.length; rangeIndex++){
        if (range[rangeIndex] == data[i]['dateStr']){
          if (dataSubset[rangeIndex] == null){
            dataSubset[rangeIndex] = [];
          }

          dataSubset[rangeIndex].push(data[i])
          dataSubset[rangeIndex]['xaxis'] = DAYS[rangeIndex];
        }
      }

      if (data[i]['date'][2] < minimumDate[2] && data[i]['date'][1] <= minimumDate[1] && data[i]['date'][0] <= minimumDate[0]){
        break;
      }
    }

    //reversing all elements since we started from the end of the data
    for (var i = 0; i < dataSubset.length; i++){
      if (dataSubset[i] == null){
        dataSubset.splice(i, 1);
        i--;
      }
      else {
        dataSubset[i].reverse();
      }
    }

    var title;
    var rangeStart = parseDate(range[0]);
    var rangeEnd = parseDate(range[6]);
    if (rangeStart[1] != rangeEnd[1]){ //week is inbetween two months
      if (rangeStart[1] == 12 && rangeEnd[1] == 1){ //week is inbetween December and January
        title = "Dec " + rangeStart[2] + ", " + rangeStart[0] + " - "
              + "Jan " + rangeEnd[2] + ", " + rangeEnd[0];
      }
      else {
        title = MONTHSHORT[rangeStart[1] - 1] + " " + rangeStart[2] + " - "
              + MONTHSHORT[rangeEnd[1] - 1] + " " + rangeEnd[2] + ", " + rangeEnd[0];
      }
    }
    else {
      title = MONTHSHORT[rangeStart[1] - 1] + " " + rangeStart[2] + " - "
            + rangeEnd[2] + ", " + rangeEnd[0];
    }

    domainType = 2;
    createPlot(dataSubset, 'b', title);
  }
  else if (scope == 'm'){
    //highlighting the week block
    var block = d3.select("#monthBlock");
    block.style("background", "#FEECEB");

    var dateArr = parseDate(date);
    var year = dateArr[0];
    var month = dateArr[1];
    var exists = false;

    //getting the subset of data
    for (var i = data.length-1; i >= 0; i--){
      if (year > data[i]['date'][0] && month > data[i]['date'][1]){
        break;
      }

      if (year != data[i]['date'][0]){
        continue;
      }
      else {
        if (month != data[i]['date'][1]){
          continue;
        }
        else {
          for (var j = 0; j < dataSubset.length; j++){
            if (dataSubset[j][0]['dateStr'] == data[i]['dateStr']){
              exists = true;
              dataSubset[j].push(data[i])
              dataSubset[j]['xaxis'] = data[i]['date'][2];
            }
          }

          //New entry
          if (exists == false){
            dataSubset.push([data[i]]);
            dataSubset[dataSubset.length - 1]['xaxis'] = data[i]['date'][2];
          }
          else {
            exists = false;
          }
        }
      }
    }

    var title = MONTHS[month-1] + " " + year;

    dataSubset.reverse(); //reversing the data since we got it from descending order
    domainType = 1;
    createPlot(dataSubset, 'b', title);
  }
  else if (scope == 'y'){
    //highlighting the week block
    var block = d3.select("#yearBlock");
    block.style("background", "#FEECEB");

    var dateArr = parseDate(date);
    var year = dateArr[0];
    var recentDate;

    //getting the subset of data
    for (var i = data.length-1; i >= 0; i--){
      if (year > data[i]['date'][0]){
        break;
      }

      if (year != data[i]['date'][0]){
        continue;
      }
      else {
        if (dataSubset.length == 0 || dataSubset[dataSubset.length-1][0]['date'][1] != data[i]['date'][1]){
          dataSubset.push([data[i]]);
          dataSubset[dataSubset.length - 1]['xaxis'] = MONTHS[data[i]['date'][1] - 1];
        }
        else {
          dataSubset[dataSubset.length-1].push(data[i])
          dataSubset[dataSubset.length-1]['xaxis'] = MONTHS[data[i]['date'][1] - 1];
        }
      }
    }

    var title = year;
    dataSubset.reverse(); //reversing the data since we got it from descending order
    domainType = 0;
    createPlot(dataSubset, 'b', title);
  }
  else {
    console.log("error with setScope()");
  }
}

function loadData(fileName){
  data = [];
  if (fileName != null){
    //add try/catch
    d3.csv(fileName, function(error, csv) {
      if (error) throw error;

      var dateObj;
      var previousDateStr = null;
      var timeStr;
      var index = 0;
      var afternoon = false;
      csv.forEach(function(x) {
        var dateStr = x.date,
        timeStr = x.time,
        heartRate = parseInt(x.hr);

        var dateArr = parseDate(dateStr);
        var timeArr = parseTime(timeStr);

        //Checking if the time has passed the 12 hour mark
        if (index != 0 && dateStr == previousDateStr){
          if (afternoon == false){
            if (timeArr[0] < data[index-1]['time'][0]){
              afternoon = true;
            }
          }
        }
        else {
          afternoon = false;
        }

        //Adding 12 hours to the time since it resets to 0 in the data
        if (afternoon == true){
          timeArr[0] += 12;
        }

        //dateObj = GetDate(dateStr, timeStr);

        data[index] = [];
        data[index].push(heartRate);
        data[index]['date'] = dateArr;
        data[index]['dateStr'] = dateArr[1] + "/" + dateArr[2] + "/" + dateArr[0]; //because the year in the data is simplified
        data[index]['time'] = timeArr;

        previousDateStr = dateStr;
        index++;
      });

      setScope('d');
    });
  }
}

function submitClick(){
  //document.getElementById("profile-form").submit();
  age = parseInt(document.getElementById("age").value);
  firstName = document.getElementById("firstName").value;
  lastName = document.getElementById("lastName").value;
  var e = document.getElementById("fitnessLevel");
  fitnessLevel = e.options[e.selectedIndex].text;
}

//Returns an array with the indices of all the outliers
function findOutliers(d){
  var deviation = d3.deviation(d, function(i){ return i[0]; });
  var mean = d3.mean(d, function(i){ return i; });
  var upperRange = mean + 2*deviation;
  var lowerRange = mean - 2*deviation;

  var outlierIndices = [];
  for(var i = 0; i < d.length; i++){
    if (d[i] < lowerRange){
      outlierIndices.push(i);
      continue;
    }

    if (d[i] > upperRange){
      outlierIndices.push(i);
      continue;
    }
  }
  return outlierIndices;
}

function whiskers(d) {
  return [0, d.length - 1];
}

function quartiles(d) {
  return [
    d3.quantile(d, .25),
    d3.quantile(d, .5),
    d3.quantile(d, .75)
  ];
}


//Returns new data array that discludes all invalid outliers
function validReadings(){
  var index1, index2, index3, min1, min2, min3;

  var valid = [];
  for (var i = 1; i < indices.length-1; i++){
    index1 = indices[i-1];
    index2 = indices[i];
    index3 = indices[i+1];

    time1 = data[index1]['time'];
    time2 = data[index2]['time'];
    time3 = data[index3]['time'];

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

function partition(data, low, high){
  var pivot = data[high];
  var i = low - 1;
  var temp;

  for (var j = low; j <= high-1; j++){
    if (data[j] <= pivot){
      i++;

      temp = data[i];
      data[i] = data[j];
      data[j] = temp;
    }
  }
  temp = data[i + 1];
  data[i + 1] = data[high];
  data[high] = temp;

  return i + 1;
}

function quicksort(dataSubset, i, j){
  if (i < j){
    var partitionIndex = partition(dataSubset, i, j);
    quicksort(dataSubset, i, partitionIndex-1);
    quicksort(dataSubset, partitionIndex+1, j)
  }
}
