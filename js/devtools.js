// Creating a new panel in DevTools
chrome.devtools.panels.create(
  "URL Redirect",
  "icons/icon16.png",
  "devtools-panel.html",
  function(panel) {
    console.log("DevTools panel for URL Redirect has been created");
  }
); 