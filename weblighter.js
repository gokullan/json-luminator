console.log(BlockElementNames)

document.addEventListener('keydown', (event) => {
  try {
    let objToSave;
    // `Ctrl + s` to save highlights
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault()
      let rootNode = document.querySelector('body')
      let children = _.get(rootNode, 'childNodes');
      objToSave = { "highlights": [] }
      storeAll(rootNode, children, objToSave);
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
      createHighlight(selection);
      break;
    }
    case 1: {
      removeHighlight(selection);
      break;
    }
  }
})

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
  // create the range of highlight
  const highlightRange = new Range();
  highlightRange.setStart(selection.anchorNode, selection.anchorOffset);
  highlightRange.setEnd(selection.focusNode, selection.focusOffset);
  // make the highlight!
  let markNode = document.createElement('mark');
  markNode.appendChild(highlightRange.extractContents());
  highlightRange.insertNode(markNode);
}

function shouldMergeNodes() {
}

function getBlockParent(node) {
  /*
   * - The "block parent" of a node is that ancestor whose node-name is one of `BlockElementNames`
   *   (defined in `constants.js`; these elements are also referred to as block-level elements)
   * - Since this function is used in the context of checking if a given highlight is to be created or removed,
   *   the 'MARK' node is also considered "block parent" 
   */
  let currentNode = node;
  while (
    currentNode &&
    _.get(currentNode, 'nodeName') !== 'MARK' &&
    !_.includes(BlockElementNames, _.get(currentNode, 'nodeName'))
  ) {
    currentNode = _.get(currentNode, 'parentNode');
  }
  return currentNode;
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

function computeFocusOffset(markNode) {
  const lastChildNode = _.last(markNode.childNodes);
  return _.get(
    lastChildNode, 
    'innerText.length', 
    _.get(lastChildNode, 'length')
  );
}

function storeAll(rootNode, children, objToSave, path=[]) {
  try {
    if (_.get(rootNode, 'childElementCount') > 0) {
      // iterate DOM
      for (let i = 0; i < children.length; ++i) {
        let currentNode = children[i];
        if (_.get(currentNode, 'nodeName') === "MARK") {
           _.get(objToSave, 'highlights').push({
             "path": _.concat(path, i),
             "offsetStart": _.get(currentNode, 'previousSibling.length', 0),
             "offsetEnd": computeFocusOffset(currentNode),
             "n": currentNode.childNodes.length - 2
           })
          console.log(_.last(_.get(objToSave, 'highlights')));
        }
        storeAll(
          currentNode,
          _.get(currentNode, 'childNodes'),
          objToSave,
          _.concat(path, i)
        )
      }
    }
  } catch(err) {
    console.log(err);
  }
}

function restoreHighlights(savedObj) {
  try {
    const savedHighlights = _.get(savedObj, 'highlights', []);
    _.forEach(savedHighlights, (highlight) => {
      let { path, offsetStart, offsetEnd, n } = highlight;
      let node = document.querySelector('body')
      _.forEach(path, (childIndex, i) => {
        // stop with last-but-one
        if (i !== path.length - 1) {
          node = node.childNodes[childIndex]
        }
      })
      let anchorNode, focusNode;
      if (_.get(node, `childNodes[${_.last(path)}]`)) {
        // there is already an existing node present at the position where the `mark` node should be
        anchorNode = _.get(node,`childNodes[${_.last(path) - 1}]`, _.get(node, `childNodes[${_.last(path)}]`));
        focusNode = _.get(node,`childNodes[${_.last(path) + n}]`) // `n` => # of child-nodes encompassed by the mark-node 
        console.log(anchorNode)
        console.log(focusNode)
      }
      else {
        // anchor and focus nodes are the same
        anchorNode = _.get(node, `childNodes[${_.last(path) - 1}]`);
        focusNode = _.get(node, `childNodes[${_.last(path) - 1}]`);
        offsetEnd += offsetStart 
      }
      // create the range of highlight
      const highlightRange = new Range();
      highlightRange.setStart(anchorNode, offsetStart);
      highlightRange.setEnd(focusNode, offsetEnd);
      // make the highlight!
      let markNode = document.createElement('mark');
      markNode.appendChild(highlightRange.extractContents());
      highlightRange.insertNode(markNode);
    })
  } catch(err) {
    console.log(err)
  }
}

function download(objToSave, name) {
  var a = document.createElement('a');
  var file = new Blob([JSON.stringify(objToSave)], {type: 'application/json'});
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();
}
