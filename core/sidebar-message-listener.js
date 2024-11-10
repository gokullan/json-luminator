(function () {
  if (window.hasRun) {
      return;
    }
    window.hasRun = true;
  
  function consumeMessage(request, sender, sendResponse) {
    try {
      console.log(request)
      const command = _.get(request, 'name')
      const params = _.get(request, 'params')
      if (command === 'save') {
        StoreRestore.saveHighlights(params)
      }
      else if (command === 'restore') {
        // TODO: change function name
        StoreRestore.getFile(params)
      }
      else if (command === 'toggle') {
        HighlightDehiglight.toggleHighlight(params)
      }
    } catch(err) {
      console.log(err);
    }
  }
  browser.runtime.onMessage.addListener(consumeMessage);
}())
