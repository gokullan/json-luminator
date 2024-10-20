(function () {
  if (window.hasRun) {
      return;
    }
    window.hasRun = true;
  
  function consumeMessage(request, sender, sendResponse) {
    try {
      console.log(request)
      const command = _.get(request, 'name')
      if (command === 'save') {
        StoreRestore.saveHighlights()
      }
      else if (command === 'restore') {
        // TODO: change function name
        StoreRestore.getFile(request)
      }
    } catch(err) {
      console.log(err);
    }
  }
  browser.runtime.onMessage.addListener(consumeMessage);
}())
