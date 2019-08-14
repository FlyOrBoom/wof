chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('browser.html', {
      id:'w',
      state:'maximized',
      frame:'none',
      innerBounds: {
          minWidth: 400,
          minHeight: 300
      }
      });
});