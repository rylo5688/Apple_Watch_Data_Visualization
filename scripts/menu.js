function openMenu(){
  d3.select(".sideMenu").style("width", "150px");
}

function closeMenu(){
  d3.select(".sideMenu").style("width", "0");
}

function openHomePage(){
  console.log('call');
  d3.select(".sideMenu").style("width", "0");
  d3.select(".profile").style("display", "none");
  d3.select(".home").style("display", "block");
  d3.select("#homeLabel").style("background", "#212121");
  d3.select("#profileLabel").style("background", "#111");
}

function openProfilePage(){
  d3.select(".sideMenu").style("width", "0");
  d3.select(".home").style("display", "none");
  d3.select(".profile").style("display", "block");
  d3.select("#profileLabel").style("background", "#212121");
  d3.select("#homeLabel").style("background", "#111");
}
