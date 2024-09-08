function traverse(root, destination, upperLimitNode) {
  try {
    console.log(root)
    if (!root) {
      console.log("Node undefined")
      return true
    }
    else if (root.isEqualNode(upperLimitNode)) {
      console.log("Unable to reach destination. Please check")
      return false;
    }
    else if (root.isEqualNode(destination)) {
      return true;
    }
    else {
      // traverse through all child-nodes first
      const childNodes = root['childNodes'] || [];
      for (let child of childNodes) {
        const isDestinationReached = traverse(child, destination, upperLimitNode);
        if (isDestinationReached) {
          return true;
        }
      }
      // traverse through all siblings
      let currentSibling = root['nextSibling'];
      while (currentSibling) {
        const isDestinationReached = traverse(currentSibling, destination, upperLimitNode);
        if (isDestinationReached) {
          return true;
        }
        currentSibling = currentSibling['nextSibling']
      }
      // commence next traversal with parent's next-sibling
      let parentNode = root['parentNode']
      let nextNode = parentNode['nextSibling']
      while (!nextNode) {
        parentNode = parentNode['parentNode']
        nextNode = parentNode['nextSibling'] 
      }
      return traverse(nextNode, destination, upperLimitNode)
    }
  } catch(err) {
    console.log(err);
  }
}

function getFirstTextNode(node) {
  if (node['nodeName'] === '#text') {
    return node;
  }
  else {
    const childNodes = node['childNodes'];
    if (!childNodes) {
      return null;
    }
    for (let child of childNodes) {
      const textNode = getFirstTextNode(child);
      if (textNode) {
        return textNode;
      }
    }
  }
}

function getNextTextNode(node, upperLimitNode) {
  if (!node.isEqualNode(upperLimitNode)) {
    let currentNode = node;
    let parentNode = currentNode['parentNode'];
    // traverse right on the same level
    while (currentNode) {
      currentNode = currentNode['nextSibling'];
      if (currentNode['nodeName'] === '#text') {
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
function createHighlight(textNode, anchorOffset=null, focusOffset=null) {
  // create the range of highlight
  const highlightRange = new Range();
  highlightRange.setStart(textNode, anchorOffset);
  highlightRange.setEnd(textNode, focusOffset);
  // check if the text-node is already highlighted
  if (textNode.parentNode.nodeName === 'MARK') {
    return textNode.parentNode
  }
  // make the highlight!
  let markNode = document.createElement('mark');
  highlightRange.surroundContents(markNode);
  // markNode.normalize()
  return markNode;
}

function traverse(root, destination, upperLimitNode, nodesSoFar) {
  try {
    if (!root || root.isEqualNode(upperLimitNode)) {
      console.log("Unable to reach destination. Please check")
      return false;
    }
    // maintain order of traversal
    console.log(root)
    if (root.isEqualNode(destination)) {
      return true;
    }
    else {
      // traverse through all child-nodes first
      const childNodes = root['childNodes'];
      for (let child of childNodes) {
        const isDestinationReached = traverse(child, destination, upperLimitNode, nodesSoFar);
        if (isDestinationReached) {
          return true;
        }
      }
      // traverse through siblings
      let currentSibling = root['nextSibling'];
      while (currentSibling) {
        const isDestinationReached = traverse(currentSibling, destination, upperLimitNode, nodesSoFar);
        if (isDestinationReached) {
          return true;
        }
      }
      // commence next traversal with parent's next-sibling
      const nextNode = root['parentNode.nextSibling'];
      traverse(nextNode, destination, upperLimitNode, nodesSoFar)
    }
  } catch(err) {
    console.log(err);
  }
}
