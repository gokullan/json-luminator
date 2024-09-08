function isValidSelectionForHighlight(selection) {
  /*
   * Conditions for creating a highlight:
   * - Anchor and focus nodes should be text-nodes
   *   (this has been the observed behaviour, so some of the logic is based on this)
   * - Anchor and focus nodes should have the same "block parent"
   *   (see below for the notion of a "block parent")
   */
  if (
    selection.anchorNode.nodeName !== "#text" || selection.focusNode.nodeName !== "#text"
  ) {
    console.log(Messages.SelectionNotExpected)
    return false;
  }
  else if (getBlockParent(selection.anchorNode) != getBlockParent(selection.focusNode)) {
    console.log(Messages.AncestorIncompatibility)
    return false;
  }
  return true;
}

function getHighlightClasses(textNode, anchorOffset, focusOffset, isAnchorNode=false, isFocusNode=false) {
  let classes = ['highlight-g']
  if (isAnchorNode) {
    if (anchorOffset === 0) {
      classes.push('highlight-start-ns')
    }
    else {
      classes.push('highlight-start-s')
    }
  }
  if (isFocusNode) {
    if (focusOffset === _.get(textNode, 'length')) {
      classes.push('highlight-end-ns')
    }
    else {
      classes.push('highlight-end-s')
    }
  }
  return classes
}

function createHighlight(textNode, anchorOffset, focusOffset, isAnchorNode=false, isFocusNode=false) {
  // validate offsets
  if (anchorOffset === focusOffset) {
    if (isAnchorNode || isFocusNode) {
      return textNode;
    }
  }
  // get classes
  const classes = getHighlightClasses(textNode, anchorOffset, focusOffset, isAnchorNode, isFocusNode);
  // create the range of highlight
  const highlightRange = new Range();
  highlightRange.setStart(textNode, anchorOffset);
  highlightRange.setEnd(textNode, focusOffset);
  // check if the text-node is already highlighted
  if (_.get(textNode, 'parentNode.nodeName') === 'MARK') {
    return textNode.parentNode
  }
  // make the highlight!
  let markNode = document.createElement('mark');
  highlightRange.surroundContents(markNode);
  // markNode.normalize()
  // set classes
  for (let className of classes) {
    markNode.classList.add(className)
  }
  return markNode;
}

function traverseAndHighlight(selection) {
  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  console.log(`anchorOffset: ${anchorOffset}, focusOffset: ${focusOffset}`);
  if (anchorNode.isEqualNode(focusNode)) {
    createHighlight(anchorNode, anchorOffset, focusOffset, true, true);
    return;
  }
  const n = traverse(selection.anchorNode, selection.focusNode, document.querySelector('body'))
  console.log(`Number of nodes to traverse = ${n}`)
  // highlight anchor-node
  const markNode = createHighlight(anchorNode, anchorOffset, anchorNode.length, true)
  // highlight nodes between anchor and focus nodes
  let currentNode = getNextTextNode(markNode, document.querySelector('body'));
  let i = 2;
  while (!_.isNil(currentNode) && i < n) {
    const markNode = createHighlight(currentNode, 0, currentNode.length);
    currentNode = getNextTextNode(markNode, document.querySelector('body'));
    i += 1;
  }
  // highlight focus-node
  createHighlight(currentNode, 0, focusOffset, false, true);
}

function isAlreadyHighlighted(selection) {
  try {
    const anchorNode = _.get(selection, 'anchorNode'),
      focusNode = _.get(selection, 'focusNode');
    // const blockParentOfAnchor = getBlockParent(anchorNode),
    //   blockParentOfFocus = getBlockParent(focusNode);
    // if (
    //   _.get(blockParentOfFocus, 'nodeName') === 'MARK' &&
    //   blockParentOfFocus == blockParentOfAnchor
    // ) {
    if (
      _.get(anchorNode, 'parentNode.nodeName') === 'MARK' ||
      _.get(focusNode, 'parentNode.nodeName' === 'MARK')
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
  const { anchorNode, focusNode, anchorOffset, focusOffset } = selection;
  if (anchorNode.isEqualNode(focusNode)) {
    // make no changes
    return selection;
  }
  let selectionStandardized = {}
  if (
    _.get(anchorNode, 'length') == anchorOffset 
  ) {
    selectionStandardized.anchorNode = getNextTextNode(anchorNode, focusNode);
    selectionStandardized.anchorOffset = 0
  }
  else {
    selectionStandardized.anchorNode = anchorNode;
    selectionStandardized.anchorOffset = anchorOffset; 
  }
  if (
    _.get(selection, 'focusOffset') == 0
  ) {
    selectionStandardized.focusNode = getPreviousTextNode(focusNode, document.querySelector('body'), anchorNode);
    selectionStandardized.focusOffset = _.get(focusNode, 'length');
  }
  else {
    selectionStandardized.focusNode = focusNode;
    selectionStandardized.focusOffset = focusOffset; 
  }
  return selectionStandardized;
}
