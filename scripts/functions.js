// Returns a function to compute the interquartile range. (k should be 1.5)
function iqr(k) {
  return function(d, i) {
    var q1 = d['quartiles'][0],
    q3 = d['quartiles'][2],
    iqr = (q3 - q1) * k,
    i = -1,
    j = d.length;
    while (d[++i] < q1 - iqr);
    while (d[--j] > q3 + iqr);

    if (i == d.length && j == -1){ //whiskers are the min/max of the data
      return [0, d.length-1];
    }
    return [i, j];
  };
}

function getOutliers(d, lower, upper){
  var indices = [];
  for (var i = 0; i < d.length; i++){
    if (d[i] < lower){
      indices.push(i);
    }
    if (d[i] > upper){
      indices.push(i);
    }
  }

  return indices;
}

function validOutliers(d, indices){
  var index1, index2, index3, index4, index5, time1, time2, time3, time4, time5, sec1, sec2, sec3, sec4, sec5;
  var size = indices.length;

  var valid = [];

  //edge cases
  if (size == 1){
    index3 = indices[0];
    if (d[index3] > 100){
      if (!falsePositive(d, index3)){
        valid.push(index3);
      }
    }
    return valid;
  }
  else if (size == 2){
    index2 = indices[1]
    index3 = indices[0];

    time2 = d[index2]['time'];
    time3 = d[index3]['time'];

    sec2 = time2[0]*3600 + time2[1]*60 + time2[2];
    sec3 = time3[0]*3600 + time3[1]*60 + time3[2];

    //RULE 2 - If there are 2 readings that are exactly the same or one beat apart, within 1 minute , then it’s considered a valid reading.
    //case 1: index2-index3
    if (Math.abs(d[index2] - d[index3]) <= 1 && Math.abs(sec2 - sec3) <= 60){ //check that the times are within 1 minute
      valid.push(index2);
      valid.push(index3);
      return valid;
    }

    //RULE 3 - Any reading higher than 100, and that has more than 15 beats difference with the readings before and after it, within one minute, is considered false positive
    if (d[index2] > 100){
      if (!falsePositive(d, index2)){
        valid.push(index2);
      }
    }
    if (d[index3] > 100){
      if (!falsePositive(d, index3)){
        valid.push(index3);
      }
    }
    return valid;
  }
  else if (size == 3){
    index1 = indices[2];
    index2 = indices[1]
    index3 = indices[0];

    time1 = d[index1]['time'];
    time2 = d[index2]['time'];
    time3 = d[index3]['time'];

    sec1 = time1[0]*3600 + time1[1]*60 + time1[2];
    sec2 = time2[0]*3600 + time2[1]*60 + time2[2];
    sec3 = time3[0]*3600 + time3[1]*60 + time3[2];

    //RULE 1 - If the outliers included 3 readings they were less than 5 beats apart and measured within 2 minutes
    //Then they are considered valid
    //case 1: index1-index3
    if (Math.abs(d[index1] - d[index2]) <= 5 && Math.abs(d[index2] - d[index3]) <= 5 && Math.abs(d[index3] - d[index1]) <= 5){
      if (Math.abs(sec1 - sec2) <= 120 && Math.abs(sec2 - sec3) <= 120 && Math.abs(sec3 - sec1) <= 120){ //check that the times are within 2 minutes
        valid.push(index1);
        valid.push(index2);
        valid.push(index3);
        return valid;
      }
    }

    //RULE 2 - If there are 2 readings that are exactly the same or one beat apart, within 1 minute , then it’s considered a valid reading.
    //case 1: index2-index3
    if (Math.abs(d[index2] - d[index3]) <= 1 && Math.abs(sec2 - sec3) <= 60){ //check that the times are within 1 minute
      valid.push(index2);
      valid.push(index3);

      if (Math.abs(d[index1] - d[index2]) <= 1 && Math.abs(sec1 - sec2) <= 60){
        valid.push(index1);
      }
      return valid;
    }
    else if (Math.abs(d[index1] - d[index2]) <= 1 && Math.abs(sec1 - sec2) <= 60){
      valid.push(index1);
      valid.push(index2);
      return valid;
    }

    //RULE 3 - Any reading higher than 100, and that has more than 15 beats difference with the readings before and after it, within one minute, is considered false positive
    if (d[index1] > 100){
      if (!falsePositive(d, index1)){
        valid.push(index1);
      }
    }
    if (d[index2] > 100){
      if (!falsePositive(d, index2)){
        valid.push(index2);
      }
    }
    if (d[index3] > 100){
      if (!falsePositive(d, index3)){
        valid.push(index3);
      }
    }
    return valid;
  }

  //size >= 3
  for (var i = 0; i < size; i++){
    if (i == 0){ //edge case
      index1 = indices[i+2];
      index2 = indices[i+1]
      index3 = indices[i];
      index4 = index1; //due to edge case
      index5 = index2; //due to edge case
    }
    else if (i == 1){ //edge case
      index1 = indices[i+2];
      index2 = indices[i+1]
      index3 = indices[i];
      index4 = indices[i-1];
      index5 = index2; //due to edge case
    }
    else if (i == size-2){ //edge case
      index1 = indices[i-2];
      index2 = indices[i-1]
      index3 = indices[i];
      index4 = indices[i+1];
      index5 = index2; //due to edge case
    }
    else if (i == size-1){ //edge case
      index1 = indices[i-2];
      index2 = indices[i-1]
      index3 = indices[i];
      index4 = index1; //due to edge case
      index5 = index2; //due to edge case
    }
    else { //normal cases
      index1 = indices[i-2];
      index2 = indices[i-1]
      index3 = indices[i];
      index4 = indices[i+1];
      index5 = indices[i+2];
    }

    //variables used to test if certain rules hold

    time1 = d[index1]['time'];
    time2 = d[index2]['time'];
    time3 = d[index3]['time'];
    time4 = d[index4]['time'];
    time5 = d[index5]['time'];

    sec1 = time1[0]*3600 + time1[1]*60 + time1[2];
    sec2 = time2[0]*3600 + time2[1]*60 + time2[2];
    sec3 = time3[0]*3600 + time3[1]*60 + time3[2];
    sec4 = time4[0]*3600 + time4[1]*60 + time4[2];
    sec5 = time5[0]*3600 + time5[1]*60 + time5[2];

    //RULE 1 - If the outliers included 3 readings they were less than 5 beats apart and measured within 2 minutes
    //Then they are considered valid
    //case 1: index1-index3
    if (Math.abs(d[index1] - d[index2]) <= 5 && Math.abs(d[index2] - d[index3]) <= 5 && Math.abs(d[index3] - d[index1]) <= 5){
      if (Math.abs(sec1 - sec2) <= 120 && Math.abs(sec2 - sec3) <= 120 && Math.abs(sec3 - sec1) <= 120){ //check that the times are within 2 minutes
        valid.push(index3);
        continue;
      }
    }
    //case 2: index2-index4
    if (Math.abs(d[index2] - d[index3]) <= 5 && Math.abs(d[index3] - d[index4]) <= 5 && Math.abs(d[index4] - d[index2]) <= 5){
      if (Math.abs(sec2 - sec3) <= 120 && Math.abs(sec3 - sec4) <= 120 && Math.abs(sec4 - sec2) <= 120){ //check that the times are within 2 minutes
        valid.push(index3);
        continue;
      }
    }
    //case 3: index3-index5
    if (Math.abs(d[index3] - d[index4]) <= 5 && Math.abs(d[index4] - d[index5]) <= 5 && Math.abs(d[index5] - d[index3]) <= 5){
      if (Math.abs(sec3 - sec4) <= 120 && Math.abs(sec4 - sec5) <= 120 && Math.abs(sec5 - sec3) <= 120){ //check that the times are within 2 minutes
        valid.push(index3);
        continue;
      }
    }

    //RULE 2 - If there are 2 readings that are exactly the same or one beat apart, within 1 minute , then it’s considered a valid reading.
    //case 1: index2-index3
    if (Math.abs(d[index2] - d[index3]) <= 1 && Math.abs(sec2 - sec3) <= 60){ //check that the times are within 1 minute
      valid.push(index3);
      continue;
    }
    //case 2: index3-index4
    if (i != 0 && i != size-1){ //some edge cases will not work
      if (Math.abs(d[index3] - d[index4]) <= 1 && Math.abs(sec3 - sec4) <= 60){
        valid.push(index3);
        continue;
      }
    }

    //RULE 3 - Any reading higher than 100, and that has more than 15 beats difference with the readings before and after it, within one minute, is considered false positive
    if (d[index3] > 100){
      if (!falsePositive(d, index3)){
        valid.push(index3);
      }
    }
  }

  return valid;
}

//RULE 3 - Any reading higher than 100, and that has more than 15 beats difference with the readings before it, within one minute, is considered false positive
function falsePositive(d, index){
  var sec = d[index]['time'][2]*3600 + d[index]['time'][1]*60 + d[index]['time'][2];
  var secCurrent;

  //checking 1 minute before
  for (var i = index-1; i >= 0; i--){
    secCurrent = d[i]['time'][2]*3600 + d[i]['time'][1]*60 + d[i]['time'][2];
    if (Math.abs(sec - secCurrent) <= 60){
      if (Math.abs(d[index] - d[i]) > 15){
        return true; //reading is false positive
      }
    }
    else{
      break;
    }
  }

  return false;
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
