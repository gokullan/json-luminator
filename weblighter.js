document.addEventListener('keydown', (event) => {
  try {
    let objToSave;
    // `Ctrl + s` to save highlights
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault()
      let rootNode = document.querySelector('body')
      objToSave = { "highlights": [] }
      storeAll(rootNode, objToSave);
      download(objToSave, 'highlight-1.json')
    }
    // `Ctrl + r` to restore highlights
    else if (event.ctrlKey && event.key === 'r') {
      event.preventDefault()
      objToSave = savedHighlights;
      restoreHighlights(objToSave);
    }
  } catch(err) {
    console.log(err);
  }
})

document.addEventListener('click', (event) => {
  const selection = window.getSelection();
  if (!selection.toString() || selection.toString().length == 0) {
    return;
  }
  const highlightFlag = isAlreadyHighlighted(selection);
  switch(highlightFlag) {
    case 0: {
      // createHighlight(selection);
      traverseAndHighlight(standardizeSelection(selection))
      break;
    }
    case 1: {
      removeHighlight(standardizeSelection(selection));
      break;
    }
  }
})

