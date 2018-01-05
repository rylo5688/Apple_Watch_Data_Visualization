// Returns a function to compute the interquartile range. (k should be 1.5)
function iqr(k) {
  return function(d, i) {
    console.log(d);
    var q1 = d['quartiles'][0],
    q3 = d['quartiles'][2],
    iqr = (q3 - q1) * k,
    i = -1,
    j = d.length;
    while (d[++i] < q1 - iqr){};
    while (d[--j] > q3 + iqr);

    if (i == d.length && j == -1){ //whiskers are the min/max of the data
      return [0, d.length-1];
    }
    return [i, j];
  };
}

function validOutliers(d, dUnsorted, indices){
  var index1, index2, index3, min1, min2, min3;

  var valid = [];

  //edge cases
  if (indices.length == 1) {
    return valid;
  }
  else if(indices.length == 2){
    index1 = indices[0];
    index2 = indices[1];

    time1 = d[index1]['time'];
    time2 = d[index2]['time'];

    min1 = time1[1];
    min2 = time2[1];

    //rule 2 - If there are 2 readings that are exactly the same or one beat apart, within 1 minute , then it’s considered a valid reading.
    if (time1[0] == time2[0]){
      if (Math.abs(d[index1] - d[index2]) <= 1 && Math.abs(min1 - min2) <= 1){
        valid.push(index1);
        valid.push(index2);
      }
    }

    return valid;
  }

  var edgeCase = false;
  for (var i = 0; i < indices.length; i++){
    edgeCase = false;
    if (i == 0){ //edge case
      edgeCase = true;
      index1 = indices[i+1];
      index2 = indices[i];
      index3 = indices[i+2];
    }
    else if (i == indices.length-1){ //edge case
      edgeCase = true;
      index1 = indices[i-1];
      index2 = indices[i];
      index3 = indices[i-2];
    }
    else {
      index1 = indices[i-1];
      index2 = indices[i];
      index3 = indices[i+1];
    }

    //variables used to test if certain rules hold
    time1 = d[index1]['time'];
    time2 = d[index2]['time'];
    time3 = d[index3]['time'];

    min1 = time1[1];
    min2 = time2[1];
    min3 = time3[1];

    //rule 1 - If the outliers included 3 readings they were less than 5 beats apart and measured within 2 minutes
    //Then they are considered valid
    if (Math.abs(d[index1] - d[index2]) <= 5 && Math.abs(d[index2] - d[index3]) <= 5 && Math.abs(d[index3] - d[index1]) <= 5){
      if (time1[0] == time2[0] && time2[0] == time3[0]){ //checking for matching hours
        if (Math.abs(min1 - min2) <= 2 && Math.abs(min2 - min3) <= 2 && Math.abs(min3 - min1) <=2){
          if (falsePositive(d, dUnsorted, index2)){
            continue;
          }
          else{
            valid.push(index2);
            continue;
          }
        }
      }
    }

    //rule 2 - If there are 2 readings that are exactly the same or one beat apart, within 1 minute , then it’s considered a valid reading.
    if (time1[0] == time2[0]){ //checking for matching hours
      if (Math.abs(d[index1] - d[index2]) <= 1 && Math.abs(min1 - min2) <= 1){
        if (falsePositive(d, dUnsorted, index2)){
          continue;
        }
        else{
          valid.push(index2);
          continue;
        }
      }
    }

    if (time2[0] == time3[0]){
      if (Math.abs(d[index2] - d[index3]) <= 1 && Math.abs(min2 - min3) <= 1){
        if (falsePositive(d, dUnsorted, index2)){
          continue;
        }
        else{
          valid.push(index2);
          continue;
        }
      }
    }
  }

  return valid;
}

//rule 3 - Any reading higher than 100, and that has more than 15 beats difference with the readings before and after it, within one minute, is considered false positive
function falsePositive(d, dUnsorted, index){
  var date = d[index]['dateStr'];
  var hour = d[index]['time'][0];
  var min = d[index]['time'][1];
  var sec = d[index]['time'][2];

  //finding the index in the dUnsorted (which is sorted by time instead of bpm)
  for (var i = 0; i < dUnsorted.length; i++){
    if (dUnsorted[i]['dateStr'] == date){ //macthing date
      if (dUnsorted[i]['time'][0] == hour && dUnsorted[i]['time'][1] == min && dUnsorted[i]['time'][2] == sec){
        index = i;
      }
    }
  }

  var before = (index-1 == -1) ? 0 : index-1;
  var after = (index+1 == dUnsorted.length) ? dUnsorted.length-1 : index+1;

  if (dUnsorted[index] >= 100){
    if (Math.abs(dUnsorted[index] - dUnsorted[before]) >= 15 && Math.abs(dUnsorted[index] - dUnsorted[after]) >= 15){
      if (dUnsorted[before]['time'][0] == dUnsorted[index]['time'][0] && dUnsorted[index]['time'][0] == dUnsorted[after]['time'][0]){ //checking for matching hours
        if (Math.abs(dUnsorted[index]['time'][1] - dUnsorted[before]['time'][1]) <= 1 && Math.abs(dUnsorted[index]['time'][1] - dUnsorted[after]['time'][1]) <= 1 && Math.abs(dUnsorted[before]['time'][1] - dUnsorted[after]['time'][1]) <=1 ){ //checking if it is within 1 minute
          return true; //is a false positive
        }
      }
    }
  }

  return false; //not a false positive
}

function removeInvalidOutlier(d, outlierArr, validArr){
  var invalidArr = outlierArr.filter(function(e){return this.indexOf(e)<0;}, validArr); //Need to find a better way of doing this

  for (var i = 0; i < invalidArr.length; i++){
    d.splice(invalidArr[0] - i, 1); //i is the delete offset since the array gets smallers
  }
}

function heatmapColor(d, index, minBPM, maxBPM){
  var concentration = 0;

  if (maxBPM == null || d[index] <= maxBPM){
    if (d3.select("#noneFilter").property("checked") == true){ //no filter

      return "#000000";
    }
    else {
      return "#d3d3d3";
    }
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
      return "#FFFF00";
    case 1:
      return "#FFE600";
    case 2:
      return "#FFD900";
    case 3:
      return "#FFB200";
    case 4:
      return "#FF9900";
    case 5:
      return "#FF7300";
    case 6:
      return "#FF4D00";
    case 7:
      return "#FF0000";
    case 8:
    default:
      return "#FF0000";
  }
}
