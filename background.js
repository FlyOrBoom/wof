chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('browser.html', {
    id:String(Math.random()),
    state:'fullscreen',
    frame:'none',
    innerBounds: {
        minWidth: 400,
        minHeight: 300
    }
  });
});