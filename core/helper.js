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

/*
 * Gets the first descendent text-node of `node`
 */
function getFirstTextNode(node) {
  if (_.get(node, 'nodeName') === '#text') {
    return node;
  }
  else {
    const childNodes = _.get(node, 'childNodes');
    if (_.isEmpty(childNodes)) {
      return null;
    }
    for (let child of childNodes) {
      const textNode = getFirstTextNode(child);
      if (!_.isNil(textNode)) {
        return textNode;
      }
    }
  }
}

/*
 * Gets the last descendent text-node of `node`
 */
function getLastTextNode(node) {
  if (_.get(node, 'nodeName') === '#text') {
    return node;
  }
  else {
    let childNodes = _.get(node, 'childNodes');
    if (_.isEmpty(childNodes)) {
      return null;
    }
    for (let i=childNodes.length - 1; i >= 0; --i) {
      const child = childNodes[i];
      const textNode = getLastTextNode(child);
      if (!_.isNil(textNode)) {
        return textNode;
      }
    }
  }
}

function getPreviousTextNode(node, upperLimitNode, anchorNode) {
  if (node.isEqualNode(anchorNode)) {
    return anchorNode;
  }
  else if (!node.isEqualNode(upperLimitNode)) {
    let currentNode = node;
    let parentNode = _.get(currentNode, 'parentNode');
    // traverse left on the same level
    while (currentNode) {
      currentNode = _.get(currentNode, 'previousSibling');
      if (_.get(currentNode, 'nodeName') === '#text') {
        return currentNode;
      }
      else {
        const textNode = getLastTextNode(currentNode);
        if (textNode) {
          return textNode;
        }
      }
    }
    // go one-level up
    const textNode = getPreviousTextNode(parentNode, upperLimitNode, anchorNode);
    if (textNode) {
      return textNode;
    }
  }
  return null;
}

function getNextTextNode(node, upperLimitNode) {
  if (!node.isEqualNode(upperLimitNode)) {
    let currentNode = node;
    let parentNode = _.get(currentNode, 'parentNode');
    // traverse right on the same level
    while (currentNode) {
      currentNode = _.get(currentNode, 'nextSibling');
      if (_.get(currentNode, 'nodeName') === '#text') {
        return currentNode;
      }
      else {
        const textNode = getFirstTextNode(currentNode);
        if (textNode) {
          return textNode;
        }
      }
    }
    // go one-level up
    const textNode = getNextTextNode(parentNode, upperLimitNode);
    if (textNode) {
      return textNode;
    }
  }
  return null;
}

function download(objToSave, name) {
  var a = document.createElement('a');
  var file = new Blob([JSON.stringify(objToSave)], {type: 'application/json'});
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();
}
