// TODO: Decide if this logic is needed
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

// TODO: Refactor to make code more readable
function returnTextNodeIfValid(node, options={}) {
  if (_.isNil(node)) {
    return null;
  }
  const { excludeEmptyNodes, isRoot, upperLimitNode=null } = options;
  if (!isRoot && _.get(node, 'nodeName') === '#text') {
    if (!_.isNil(upperLimitNode) && node.isEqualNode(upperLimitNode)) {
      return null;
    }
    if (
      !excludeEmptyNodes ||
      excludeEmptyNodes &&_.get(node, 'length')
    ) {
      return node;
    }
  }
  return null;
}

/**
 * @param {Element} node - the root node for which the 'first' (immediate leftmost descendant) or 'last' (immediate rightmost descendant) text node is to be obtained
 * @param {string} position - string indicating whether to return the first node ('f') or the last node ('l')
 * @param {object} options - object with properties 'excludeEmptyNodes' (bool) and 'isRoot' (bool)
 * @returns {Element} - returns the necessary element if found; null otherwise 
 */
function getFirstOrLastTextNode(node, position, options={}) {
  // TODO: Any upper limit needed for recursion?
  try {
    let possibleResultNode;

    if (!_.isNil(possibleResultNode = returnTextNodeIfValid(node, options))) {
      return possibleResultNode;
    }

    const childNodes = _.get(node, 'childNodes');
    // no child nodes => return null
    if (_.isEmpty(childNodes)) {
      return null;
    }

    function getFirstTextNode() {
      for (let child of childNodes) {
        if (!_.isNil(
          possibleResultNode = getFirstOrLastTextNode(child, position, { ...options, isRoot: false })
        )) {
          return possibleResultNode
        }
        // else keep searching
      }
    }
    
    function getLastTextNode() {
      for (let i=childNodes.length - 1; i >= 0; --i) {
        const child = childNodes[i];
        if (!_.isNil(
          possibleResultNode = getFirstOrLastTextNode(child, position, { ...options, isRoot: false })
        )) {
          return possibleResultNode;
        }
        // else keep searching
      }
    }
    
    switch(position) {
      case 'f': {
        return getFirstTextNode();
      }
      case 'l': {
        return getLastTextNode();
      }
    }
  } catch(err) {
    console.log(err);
    throw err;
  }
}

/**
 * @param {Element} node - the root node for which the (immediately) preceeding or (immediately) succeeeding text node is to be obtained
 * @param {string} node - string indicating whether to return the preceeding node ('p') or the succeeeding node ('n' (for 'next'))
 * @param {object} node - object with properties 'excludeEmptyNodes' (bool) and 'isRoot' (bool) and 'upperLimitNode' (Element)
 * @returns {Element} - returns the necessary element if found; null otherwise 
 */
function getPreviousOrNextTextNode(node, position, options={}) {
  try {
    let possibleResultNode;

    if (!_.isNil(possibleResultNode = returnTextNodeIfValid(node, options))) {
      return possibleResultNode;
    }

    function _getPreviousOrNextTextNode(traversalProperty, descendantTraversalLogic) {
      let currentNode = node;
      let parentNode = _.get(currentNode, 'parentNode');
      // traverse left/right on the same level
      while (currentNode) {
        currentNode = _.get(currentNode, traversalProperty);
        if (!_.isNil(
          // TODO: The name `isRoot` is misleading here
          possibleResultNode = returnTextNodeIfValid(currentNode, {...options, isRoot: false})
        )) {
          return possibleResultNode;
        }
        else if (!_.isNil(
          // check descendants
          possibleResultNode = getFirstOrLastTextNode(currentNode, descendantTraversalLogic, { ...options, isRoot: false})
        )) {
          return possibleResultNode;
        }
      }
      // go one-level up
      if (!_.isNil(
        possibleResultNode = getPreviousOrNextTextNode(parentNode, position, { ...options, isRoot: false})
      )) {
        return possibleResultNode;
      }
      return null;
    }

    switch(position) {
      case 'p': {
        return _getPreviousOrNextTextNode('previousSibling', 'l');
      }
      case 'n': {
        return _getPreviousOrNextTextNode('nextSibling', 'f');
      }
    }
    return null;
  } catch(err) {
    console.log(err);
    throw err;
  }
}

function download(objToSave, name) {
  var a = document.createElement('a');
  var file = new Blob([JSON.stringify(objToSave)], {type: 'application/json'});
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();
}

function traverse(root, destination, upperLimitNode) {
  try {
    if (_.isNil(root)) {
      return 0;
    }
    else if (root.isEqualNode(upperLimitNode)) {
      console.log(Messages.DestinationUnreachable)
      return -1;
    }
    if (root.isEqualNode(destination)) {
      return 1;
    }
    else {
      let numberOfNodesToTraverse = 0
      if (_.get(root, 'nodeName') === '#text' && _.get(root, 'length')) {
        numberOfNodesToTraverse += 1
      }
      // traverse through all child-nodes first
      const childNodes = _.get(root, 'childNodes', []);
      for (let child of childNodes) {
        const nextNumberOfNodesToTraverse = traverse(child, destination, upperLimitNode);
        if (nextNumberOfNodesToTraverse == -1) {
          return -1;
        }
        else if (nextNumberOfNodesToTraverse == 0) {
          continue;
        }
        else {
          return numberOfNodesToTraverse + nextNumberOfNodesToTraverse
        }
      }
      // traverse through all siblings
      let currentSibling = _.get(root, 'nextSibling');
      while (currentSibling) {
        const nextNumberOfNodesToTraverse = traverse(currentSibling, destination, upperLimitNode);
        currentSibling = _.get(currentSibling, 'nextSibling')
        if (nextNumberOfNodesToTraverse == -1) {
          return -1
        }
        else if (nextNumberOfNodesToTraverse == 0) {
          continue;
        }
        else {
          return numberOfNodesToTraverse + nextNumberOfNodesToTraverse
        }
      }
      // commence next traversal with parent's next-sibling
      let parentNode  = _.get(root, 'parentNode')
      let nextNode  = _.get(parentNode, 'nextSibling')
      while (!nextNode) {
        parentNode  = _.get(parentNode, 'parentNode')
        nextNode  = _.get(parentNode, 'nextSibling') 
      }
      const nextNumberOfNodesToTraverse = traverse(nextNode, destination, upperLimitNode)
      if (nextNumberOfNodesToTraverse == -1) {
        return -1
      }
      else {
        return numberOfNodesToTraverse + nextNumberOfNodesToTraverse
      }
    }
  } catch(err) {
    console.log(err);
  }
}
