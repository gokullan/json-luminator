function testFn() {
  console.log("add")
}

function isValidSelectionForHighlight(selection) {  // TODO: include check
  /*
   * Conditions for creating a highlight:
   * - Anchor and focus nodes should be text-nodes
   *   (this has been the observed behaviour)
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

function getHighlightClasses(anchorOffset, focusOffset, isAnchorNode=false, isFocusNode=false) {
  let classes = ['highlight-g']
  if (isAnchorNode) {
    classes.push(`highlight-start-${anchorOffset}`);
  }
  if (isFocusNode) {
    classes.push(`highlight-end-${focusOffset}`);
  }
  return classes;
}

function createHighlight(textNode, anchorOffset, focusOffset, isAnchorNode=false, isFocusNode=false) {
  // validate offsets
  if (anchorOffset === focusOffset) {
    if (isAnchorNode || isFocusNode) {
      return textNode;
    }
  }
  // get classes
  const classes = getHighlightClasses(anchorOffset, focusOffset, isAnchorNode, isFocusNode);
  // create the range of highlight
  const highlightRange = new Range();
  highlightRange.setStart(textNode, anchorOffset);
  highlightRange.setEnd(textNode, focusOffset);
  // TODO: Call dedicated function
  // check if the text-node is already highlighted
  if (_.get(textNode, 'parentNode.nodeName') === 'MARK') {
    return textNode.parentNode
  }
  // make the highlight!
  let markNode = document.createElement('mark');
  highlightRange.surroundContents(markNode);
  markNode.parentNode.normalize()
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
  const options = {excludeEmptyNodes: true, isRoot: true, upperLimitNode: document.querySelector('body')}
  let currentNode = getPreviousOrNextTextNode(markNode, 'n', options)
  let i = 2;
  while (!_.isNil(currentNode) && i < n) {
    const markNode = createHighlight(currentNode, 0, currentNode.length);
    currentNode = getPreviousOrNextTextNode(markNode, 'n', options);
    i += 1;
  }
  // highlight focus-node
  createHighlight(currentNode, 0, focusOffset, false, true);
}

function isAlreadyHighlighted(selection) {  // TODO: include more checks
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
    let markNode = textNode.parentNode;  // TODO: validate
    let children = _.get(markNode, 'childNodes');
    let grandParent = markNode.parentNode;
    _.forEachRight(children, (child) => {
      grandParent.insertBefore(child, markNode);
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
  let options = {excludeEmptyNodes: true, isRoot: true};
  if (
    _.get(anchorNode, 'length') == anchorOffset 
  ) {
    // TODO: fix limit as focus-node
    selectionStandardized.anchorNode = getPreviousOrNextTextNode(anchorNode, 'n', options);
    selectionStandardized.anchorOffset = 0
  }
  else {
    selectionStandardized.anchorNode = anchorNode;
    selectionStandardized.anchorOffset = anchorOffset; 
  }
  if (
    _.get(selection, 'focusOffset') == 0
  ) {
    selectionStandardized.focusNode = getPreviousOrNextTextNode(focusNode, 'p', {...options, upperLimitNode: document.querySelector('body')});
    selectionStandardized.focusOffset = _.get(focusNode, 'length');
  }
  else {
    selectionStandardized.focusNode = focusNode;
    selectionStandardized.focusOffset = focusOffset; 
  }
  return selectionStandardized;
}
