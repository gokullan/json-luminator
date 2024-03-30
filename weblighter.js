document.body.style.border = "5px solid red";

document.addEventListener('mouseup', (event) => {
  const selection = window.getSelection();
  if (!selection.toString()) {
    // console.log("No selection")
    return;
  }
  if (isAlreadyHighlighted(selection)) {
    removeHighlight(selection);
    return;
  }
  createHighlight(selection);
})

function createHighlight(selection) {
  // console.log("Create")
  // CASE 1: anchorNode is same as focusNode
  if (selection.anchorNode == selection.focusNode) {
    // create the range of highlight
    const highlightRange = new Range();
    highlightRange.setStart(selection.anchorNode, selection.anchorOffset);
    highlightRange.setEnd(selection.focusNode, selection.focusOffset);
    // make the highlight!
    highlightRange.surroundContents(document.createElement('mark'));
  }
  // TODO CASE 2: anchorNode and focusNode are different
  else {
    console.log("Work in Progress ...");
  }
}

function isAlreadyHighlighted(selection) {
  // CASE 1: anchorNode is same as focusNode
  if (selection.anchorNode == selection.focusNode) {
    // if the node is already highlighted, its parent would be a `mark` element
    if (selection.anchorNode.parentNode.nodeName == "MARK") {
      return true;
      // return false;
    }
  }
  // TODO CASE 2: anchorNode and focusNode are different
  return false;
}

function removeHighlight(selection) {
  if (selection.anchorNode == selection.focusNode) {
    // CASE 1: Selected text is entirely the same as highlighted text
    let textNode = selection.anchorNode;
    let markNode = textNode.parentNode;
    let grandParent = markNode.parentNode;
    grandParent.insertBefore(textNode, markNode.nextSibling);
    // grandParent.insertBefore(markNode.previousSibling, textNode);
    grandParent.removeChild(markNode);
    grandParent.normalize();
    // console.log("Removed highlight")
    // CASE 2: Selected text falls within highlighted-text
    // CASE 3: Selected text = Unhighlighted text + some/ full portion of highlighted text
    // CASE 4: Selected text = Some/ full portion of highlighted text + unhighlighted text
    // CASE 5: Selected text = Unhighlighted text + entire highlighted text + unhighlighted text 
  }
}
