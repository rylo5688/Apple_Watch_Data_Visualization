function openMenu(){
  d3.select(".sideMenu").style("width", "150px");
}

function closeMenu(){
  d3.select(".sideMenu").style("width", "0");
}

function openHomePage(){
  d3.select(".sideMenu").style("width", "0");
  d3.select(".account").style("display", "none");
  d3.select(".home").style("display", "block");
}

function openAccountPage(){
  d3.select(".sideMenu").style("width", "0");
  d3.select(".home").style("display", "none");
  d3.select(".account").style("display", "block");
}
