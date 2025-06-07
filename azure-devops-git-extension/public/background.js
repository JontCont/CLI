chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg === 'open_fullscreen') {
    chrome.windows.create({
      url: chrome.runtime.getURL('index.html'),
      type: 'popup',
      width: screen.availWidth,
      height: screen.availHeight,
      top: 0,
      left: 0
    });
  }
});