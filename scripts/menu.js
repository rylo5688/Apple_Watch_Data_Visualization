function openMenu(){
  d3.select(".sideMenu").style("width", "150px");
}

function closeMenu(){
  d3.select(".sideMenu").style("width", "0");
}

function openHomePage(){
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

function openSettingsMenu(){
  d3.select(".settingsMenu").style("width", "125px");
  d3.select(".settingsMenu").style("height", "100px");
}

function closeSettingsMenu(){
  d3.select(".settingsMenu").style("width", "0");
  d3.select(".settingsMenu").style("height", "0");
}

function equalToEventTarget() {
    return this == d3.event.target;
}

//Closing menus if there are clicks outside of them
d3.select(document).on("click", function(){
  var settingsMenu = d3.select(".settingsMenu");
  var settingsMenuOpen = d3.select(".settingsMenu").style("width") != "0px";
  var sideMenu = d3.select(".sideMenu");
  var sideMenuOpen = d3.select(".sideMenu").style("width") != "0px";

  var outsideSettingsMenu = settingsMenu.filter(equalToEventTarget).empty();
  var outsideSideMenu = sideMenu.filter(equalToEventTarget).empty();

  if (outsideSettingsMenu && settingsMenuOpen){
    closeSettingsMenu();
  }

  if (outsideSideMenu && sideMenuOpen){
    closeMenu();
  }
});
