openApp = function(url) {
  if($('#mslappcontainer').length <= 0) {
    document.body.innerHTML = '<div id="mslappcontainerdiv"><iframe id="mslappcontainer" name="mslappcontainer" style="width:100%; height:800px; border:0;" src=""></iframe></div>';
  }
  $('#mslappcontainer').attr('src', url);
}

getApp = function() {
  checkAppContainerReady();
  return $('#mslappcontainer');
}

getElemFromApp = function(elementLoc) {
  checkAppContainerReady();
  return getApp().contents().find(elementLoc);
}

triggerEventOnApp = function(elementLoc, event) {
  checkAppContainerReady();
  window.frames['mslappcontainer'].eval('$("' + elementLoc + '").' + event + '()');
}

getTextFromApp = function(elementLoc) {
  checkAppContainerReady();
  return window.frames['mslappcontainer'].eval('$("' + elementLoc + '").text()');
}

checkAppContainerReady = function() {
  if($('#mslappcontainer').length <= 0) {
    throw new Error('App container is not ready.  Please call openApp() first!');
  }  
}

evalOnApp = function(eval) {
  checkAppContainerReady();
  return window.frames['mslappcontainer'].eval(eval);
}
