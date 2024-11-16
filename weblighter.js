// instantiate all classes
let Helper = new HelperClass();
let HighlightDehiglight = new HighlightDehiglightClass();
let StoreRestore = new StoreRestoreClass();
let isTabSwitched = true;

document.addEventListener('click', (event) => {
  if (isTabSwitched) {
    isTabSwitched = false;
    // get highlight-flag state from sidebar
    browser.runtime.sendMessage({ name: 'getToggle' }).then(
      (result) => {
        HighlightDehiglight.isHighlightingEnabled = true
        if (result == "Turn On") {
          HighlightDehiglight.isHighlightingEnabled = false
        }
        HighlightDehiglight.doHighlightOrDehighlight()
      }
    )
  }
  else {
    HighlightDehiglight.doHighlightOrDehighlight()
  }
})

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // indicates the tab is being switched
    isTabSwitched = true;
  }
})

