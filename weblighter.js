document.body.style.border = "5px solid red";

document.addEventListener('mouseup', (event) => {
  const selection = window.getSelection();
  if (!selection.toString()) {
    console.log("No selection!")
  }
  // create the range of highlight
  const highlightRange = new Range();
  highlightRange.setStart(selection.anchorNode, selection.anchorOffset);
  highlightRange.setEnd(selection.focusNode, selection.focusOffset);
  // make the highlight!
  highlightRange.surroundContents(document.createElement('mark'));
})
