function createHighlight(selection) {
  /*
   * Conditions for creating a highlight:
   * - Anchor and focus nodes should be text-nodes
   *   (this has been the observed behaviour, so some of the logic is based on this)
   * - Anchor and focus nodes should have the same "block parent"
   *   (see below for the notion of a "block parent")
   */
  if (selection.anchorNode.nodeName !== "#text") {
    console.log("Not a valid selection", selection.anchorNode.nodeName);
    return;
  }
  else if (getBlockParent(selection.anchorNode) != getBlockParent(selection.focusNode)) {
    console.log("Cannot highlight (as of now)");
    return;
  }
  const { useInsert, standardizedSelection } = standardizeSelection(selection);
  console.log(standardizedSelection);
  // create the range of highlight
  const highlightRange = new Range();
  highlightRange.setStart(standardizedSelection.anchorNode, standardizedSelection.anchorOffset);
  highlightRange.setEnd(standardizedSelection.focusNode, standardizedSelection.focusOffset);
  // make the highlight!
  let markNode = document.createElement('mark');
  if (useInsert) {
    markNode.appendChild(highlightRange.extractContents());
    highlightRange.insertNode(markNode);
  }
  else {
    highlightRange.surroundContents(markNode);
  }
  // TODO: normalize before highlighting also
  markNode.parentNode.normalize();
}

function isAlreadyHighlighted(selection) {
  try {
    const anchorNode = _.get(selection, 'anchorNode'),
      focusNode = _.get(selection, 'focusNode');
    const blockParentOfAnchor = getBlockParent(anchorNode),
      blockParentOfFocus = getBlockParent(focusNode);
    if (
      _.get(blockParentOfFocus, 'nodeName') === 'MARK' &&
      blockParentOfFocus == blockParentOfAnchor
    ) {
      return 1;
    }
    else {
      return 0;
    }
  } catch(err) {
    console.log(err);
  }
}

function removeHighlight(selection) {
  try {
    let textNode = selection.anchorNode;
    let markNode = getBlockParent(textNode);
    let children = _.get(markNode, 'childNodes');
    let grandParent = markNode.parentNode;
    _.forEachRight(children, (child) => {
      grandParent.insertBefore(child, markNode.nextSibling);
    })
    grandParent.removeChild(markNode);
    grandParent.normalize();
  } catch(err) {
    console.log(err);
  }
}

function standardizeSelection(selection) {
  console.log(selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset);
  if (selection.focusOffset ==
    _.get(getLastTextNode(selection.focusNode), 'length')
  ) {
    const nextTextNode = getNextTextNode(
      selection.focusNode,
      getBlockParent(selection.focusNode),
    );
    if (nextTextNode) {
      console.log("Standardizing...");
      let standardizedSelection = _.pick(selection, ['anchorNode', 'anchorOffset'])
      _.set(standardizedSelection, 'focusNode', nextTextNode);
      _.set(standardizedSelection, 'focusOffset', 0);
      return {
        useInsert: false,
        standardizedSelection
      };
    }
  }
  return {
    useInsert: true,
    standardizedSelection: _.pick(selection, ['anchorNode', 'anchorOffset', 'focusNode', 'focusOffset'])
  }
}
