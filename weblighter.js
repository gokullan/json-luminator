// instantiate all classes
let Helper = new HelperClass();
let HighlightDehiglight = new HighlightDehiglightClass();
let StoreRestore = new StoreRestoreClass();

document.addEventListener('click', (event) => {
  if (!HighlightDehiglight.isHighlightingEnabled) {
    return;
  }
  const selection = window.getSelection();
  if (!selection.toString() || selection.toString().length == 0) {
    return;
  }
  const highlightFlag = HighlightDehiglight.isAlreadyHighlighted(selection);
  const selectionStandardized = HighlightDehiglight.standardizeSelection(selection);
  switch(highlightFlag) {
    case 0: {
      HighlightDehiglight.traverseAndHighlight(selectionStandardized)
      break;
    }
    case 1: {
      HighlightDehiglight.removeHighlight(selectionStandardized);
      break;
    }
  }
})

document.addEventListener('visibilitychange', () => {
  console.log("Visibility-change", document.hidden)
})

